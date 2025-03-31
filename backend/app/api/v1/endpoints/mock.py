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

from app.api.deps import get_db
from app.models.endpoint import Endpoint
from app.models.group import Group
from app.services.json_schema import generate_from_schema

router = APIRouter()


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
    
    # Check if this is a chaos mode request
    is_chaos = request.url.path.endswith("/chaos")
    if is_chaos and not endpoint.chaos_mode:
        raise HTTPException(status_code=404, detail="Chaos mode not enabled for this endpoint")
    
    # --- START: Request Body Validation ---
    if request_method in ["POST", "PUT", "PATCH"] and endpoint.request_body_schema:
        try:
            request_body = await request.json()
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid JSON received in request body: {e}",
            )

        try:
            # Ensure schema is a dict (it should be from the DB JSON type)
            schema_to_validate = endpoint.request_body_schema
            if not isinstance(schema_to_validate, dict):
                 # This case should ideally not happen if DB/Pydantic handles JSON correctly
                 raise HTTPException(
                    status_code=500, 
                    detail="Request body schema is not configured correctly."
                )
            
            validate(instance=request_body, schema=schema_to_validate)
        except ValidationError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                # Provide helpful error details from the validation exception
                detail=f"Request body validation failed: {e.message} on path '{list(e.path)}'",
            )
        except Exception as e:
            # Catch any other unexpected errors during validation
            raise HTTPException(
                status_code=500,
                detail=f"An unexpected error occurred during request body validation: {e}"
            )
    # --- END: Request Body Validation ---
    
    # Validate headers
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
    
    # Simulate delay if configured
    if endpoint.max_wait_time > 0:
        await asyncio.sleep(random.uniform(0, endpoint.max_wait_time))
    
    # Handle chaos mode
    if is_chaos:
        # Randomly choose a chaos effect
        chaos_effect = random.choice([
            "timeout",
            "error_500",
            "slow_response",
            "random_delay",
            "random_body",
            "random_header",
            "random_status",
        ])
        
        if chaos_effect == "timeout":
            await asyncio.sleep(30)  # Simulate timeout
            raise HTTPException(status_code=504, detail="Gateway Timeout")
        elif chaos_effect == "error_500":
            raise HTTPException(status_code=500, detail="Internal Server Error")
        elif chaos_effect == "slow_response":
            await asyncio.sleep(random.uniform(1, 5))
        elif chaos_effect == "random_delay":
            await asyncio.sleep(random.uniform(0.1, 2))
        elif chaos_effect == "random_body":
            return JSONResponse(content={"error": "Random error message"}, status_code=200)
        elif chaos_effect == "random_header":
            return JSONResponse(content={"data": "Success"}, status_code=random.choice([200, 201, 202, 203]))
        elif chaos_effect == "random_status":
            return JSONResponse(content={"data": "Success"}, status_code=random.choice([400, 401, 403, 404, 500, 502, 503, 504]))
    
    # Generate response based on schema or return static body
    if endpoint.response_body:
        try:
            if isinstance(endpoint.response_body, str):
                response_body = json.loads(endpoint.response_body)
            else:
                response_body = endpoint.response_body
            return JSONResponse(content=response_body, status_code=endpoint.response_status_code)
        except json.JSONDecodeError:
            # If response_body is not valid JSON, return it as a plain text
            return PlainTextResponse(content=endpoint.response_body, status_code=endpoint.response_status_code)
    
    response_data = generate_from_schema(endpoint.response_schema)
    return JSONResponse(content=response_data, status_code=endpoint.response_status_code)


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