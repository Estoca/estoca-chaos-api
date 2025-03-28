import asyncio
import random
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.v1.dependencies import get_db
from app.models.endpoint import Endpoint
from app.models.group import Group
from app.services.json_schema import generate_from_schema

router = APIRouter()


async def handle_mock_endpoint(
    request: Request,
    group_name: str,
    endpoint_path: str,
    db: Session = Depends(get_db),
) -> Any:
    # Find the group and endpoint
    group = db.query(Group).filter(Group.name == group_name).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    endpoint = db.query(Endpoint).filter(
        Endpoint.group_id == str(group.id),
        Endpoint.name == endpoint_path,
    ).first()
    if not endpoint:
        raise HTTPException(status_code=404, detail="Endpoint not found")
    
    # Check if this is a chaos mode request
    is_chaos = request.url.path.endswith("/chaos")
    if is_chaos and not endpoint.chaos_mode:
        raise HTTPException(status_code=404, detail="Chaos mode not enabled for this endpoint")
    
    # Validate headers
    for header in endpoint.headers:
        header_value = request.headers.get(header.name)
        if header.required and header_value != header.value:
            if header.default_response and header.default_status_code:
                return header.default_response, header.default_status_code
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid header: {header.name}",
            )
    
    # Validate URL parameters
    for param in endpoint.url_parameters:
        param_value = request.query_params.get(param.name)
        if param.required and param_value != param.value:
            if param.default_response and param.default_status_code:
                return param.default_response, param.default_status_code
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
            return {"error": "Random error message"}, 200
        elif chaos_effect == "random_header":
            return {"data": "Success"}, random.choice([200, 201, 202, 203])
        elif chaos_effect == "random_status":
            return {"data": "Success"}, random.choice([400, 401, 403, 404, 500, 502, 503, 504])
    
    # Generate response based on schema or return static body
    if endpoint.response_body:
        return endpoint.response_body, endpoint.response_status_code
    
    response_data = generate_from_schema(endpoint.response_schema)
    return response_data, endpoint.response_status_code


# Dynamic route handler for all HTTP methods
@router.api_route("/{group_name}/{endpoint_path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def mock_endpoint(
    request: Request,
    group_name: str,
    endpoint_path: str,
    db: Session = Depends(get_db),
) -> Any:
    return await handle_mock_endpoint(request, group_name, endpoint_path, db)


# Chaos mode endpoint
@router.api_route("/{group_name}/{endpoint_path}/chaos", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def mock_endpoint_chaos(
    request: Request,
    group_name: str,
    endpoint_path: str,
    db: Session = Depends(get_db),
) -> Any:
    return await handle_mock_endpoint(request, group_name, endpoint_path, db) 