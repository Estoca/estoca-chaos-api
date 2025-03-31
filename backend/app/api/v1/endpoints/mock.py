import asyncio
import random
import json
from typing import Any, Dict, Optional, List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse, PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from uuid import UUID
from jsonschema import validate
from jsonschema.exceptions import ValidationError
from faker import Faker

from app.api.deps import get_db
from app.utils.json_schema import generate_data_from_schema
from app.models.endpoint import Endpoint
from app.models.group import Group

router = APIRouter()

# Initialize Faker instance
fake = Faker()

async def handle_mock_endpoint(
    request: Request,
    group_name: str,
    endpoint_path: str,
    db: AsyncSession = Depends(get_db),
) -> Any:
    # Find the group and endpoint
    # Case-insensitive search for group name
    result = await db.execute(
        select(Group).filter(func.lower(Group.name) == group_name.lower())
    )
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail=f"Group '{group_name}' not found")
    
    # Find the endpoint matching the path and method
    request_method = request.method
    result = await db.execute(
        select(Endpoint)
        .options(selectinload(Endpoint.headers), selectinload(Endpoint.url_parameters))
        .filter(
            Endpoint.group_id == str(group.id),
            Endpoint.path == endpoint_path,
            Endpoint.method == request_method
        )
    )
    endpoint = result.scalar_one_or_none()
    
    if not endpoint:
        raise HTTPException(
            status_code=404, 
            detail=f"No endpoint found with path '{endpoint_path}' and method '{request_method}' in group '{group.name}'"
        )
    
    is_chaos = request.url.path.endswith("/chaos")
    chaos_effect = None # Initialize chaos effect

    if is_chaos and not endpoint.chaos_mode:
        raise HTTPException(status_code=404, detail="Chaos mode not enabled for this endpoint")

    # Handle chaos mode selection first
    if is_chaos:
        chaos_effect = random.choice([
            "timeout",
            "error_500",
            "slow_response",
            "random_delay",
            "random_body",
            "random_valid_status",
            "random_error_status",
        ])
        
        if chaos_effect == "timeout":
            await asyncio.sleep(30)
            raise HTTPException(status_code=504, detail="Chaos Mode: Gateway Timeout Simulation")
        elif chaos_effect == "error_500":
            raise HTTPException(status_code=500, detail="Chaos Mode: Simulated Internal Server Error")
        elif chaos_effect == "random_body":
            random_data = {
                "chaos_id": fake.uuid4(),
                "chaos_message": fake.sentence(),
                "chaos_payload": {"key": fake.word(), "value": fake.random_int(min=1, max=1000)}
            }
            return JSONResponse(content=random_data, status_code=200)
        elif chaos_effect == "random_error_status":
            error_status = random.choice([400, 401, 403, 404, 429, 500, 502, 503])
            error_body = {"error": "Chaos Mode: Simulated Error", "status": error_status}
            return JSONResponse(content=error_body, status_code=error_status)
        elif chaos_effect == "slow_response":
            await asyncio.sleep(random.uniform(1, 5))
            # Fall through
        elif chaos_effect == "random_delay":
            await asyncio.sleep(random.uniform(0.1, 2))
            # Fall through
        elif chaos_effect == "random_valid_status":
            # Set override status, then fall through
            request.state.override_status_code = random.choice([200, 201, 202, 204])
            # Fall through

    # --- Request Body Validation --- (If applicable)
    if request_method in ["POST", "PUT", "PATCH"] and endpoint.request_body_schema:
        try:
            request_body = await request.json()
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid JSON received in request body: {e}",
            )
        try:
            schema_to_validate = endpoint.request_body_schema
            if not isinstance(schema_to_validate, dict):
                 raise HTTPException(status_code=500, detail="Request body schema not configured correctly.")
            validate(instance=request_body, schema=schema_to_validate)
        except ValidationError as e:
            raise HTTPException(status_code=400, detail=f"Request body validation failed: {e.message} on path \'{list(e.path)}\'")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An unexpected error occurred during request body validation: {e}")

    # --- Header/Parameter Validation --- (If applicable)
    headers_list = endpoint.headers or []
    for header in headers_list:
        header_value = request.headers.get(header.name)
        if header.required and header_value != header.value:
            if header.default_response and header.default_status_code:
                return JSONResponse(content=header.default_response, status_code=header.default_status_code)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid header: {header.name}",
            )
    
    # Validate URL parameters
    url_params_list = endpoint.url_parameters or []
    for param in url_params_list:
        param_value = request.query_params.get(param.name)
        if param.required and param_value != param.value:
            if param.default_response and param.default_status_code:
                return JSONResponse(content=param.default_response, status_code=param.default_status_code)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid parameter: {param.name}",
            )
    
    # --- Simulate Configured Delay (if chaos didn't already delay/exit) ---
    if endpoint.max_wait_time > 0 and chaos_effect not in ["slow_response", "random_delay", "timeout"]:
         await asyncio.sleep(random.uniform(0, endpoint.max_wait_time))
    
    # --- Response Generation --- 
    final_status_code = endpoint.response_status_code
    response_content: Any = {}
    response_media_type = "application/json"

    if endpoint.response_schema:
        try:
            schema_data = endpoint.response_schema
            if isinstance(schema_data, str):
                try: schema_data = json.loads(schema_data)
                except json.JSONDecodeError: raise HTTPException(status_code=500, detail="Invalid JSON schema definition stored.")
            if not isinstance(schema_data, dict): raise HTTPException(status_code=500, detail="Response schema is not a valid dictionary.")
            # Use the correct function name here
            response_content = generate_data_from_schema(schema_data) 
        except HTTPException as http_exc: raise http_exc
        except Exception as e: raise HTTPException(status_code=500, detail=f"Failed to generate response from schema: {e}")
    elif endpoint.response_body:
        try:
            response_content = json.loads(endpoint.response_body)
        except json.JSONDecodeError:
            response_content = endpoint.response_body
            response_media_type = "text/plain"

    # --- Apply Chaos Status Code Override --- 
    if hasattr(request.state, 'override_status_code'):
        final_status_code = request.state.override_status_code

    # --- Return Final Response --- 
    if response_media_type == "application/json":
        return JSONResponse(content=response_content, status_code=final_status_code)
    else:
        # Ensure content is string for PlainTextResponse
        return PlainTextResponse(content=str(response_content), status_code=final_status_code)


# Dynamic route handler for all HTTP methods
@router.api_route("/{group_name}/{endpoint_path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def mock_endpoint(
    request: Request,
    group_name: str,
    endpoint_path: str,
    db: AsyncSession = Depends(get_db),
) -> Any:
    return await handle_mock_endpoint(request, group_name, endpoint_path, db)


# Chaos mode endpoint
@router.api_route("/{group_name}/{endpoint_path}/chaos", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def mock_endpoint_chaos(
    request: Request,
    group_name: str,
    endpoint_path: str,
    db: AsyncSession = Depends(get_db),
) -> Any:
    return await handle_mock_endpoint(request, group_name, endpoint_path, db) 