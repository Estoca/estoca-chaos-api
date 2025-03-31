from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, Json
from uuid import UUID


class HeaderBase(BaseModel):
    name: str = Field(..., description="Name of the header")
    value: str = Field(..., description="Expected value of the header")
    required: bool = Field(False, description="Whether the header is required")
    default_response: Optional[Dict[str, Any]] = Field(None, description="Default response if header is missing")
    default_status_code: Optional[int] = Field(None, description="Default status code if header is missing")


class UrlParameterBase(BaseModel):
    name: str = Field(..., description="Name of the URL parameter")
    value: str = Field(..., description="Expected value of the parameter")
    required: bool = Field(False, description="Whether the parameter is required")
    default_response: Optional[Dict[str, Any]] = Field(None, description="Default response if parameter is missing")
    default_status_code: Optional[int] = Field(None, description="Default status code if parameter is missing")


class EndpointBase(BaseModel):
    name: str
    description: Optional[str] = None
    path: str
    method: str
    max_wait_time: Optional[int] = 0
    chaos_mode: Optional[bool] = True
    response_schema: Optional[Dict[str, Any]] = None
    response_status_code: Optional[int] = 200
    response_body: Optional[str] = None
    request_body_schema: Optional[Dict[str, Any]] = None
    headers: List[HeaderBase] = Field(default_factory=list, description="Expected headers")
    url_parameters: List[UrlParameterBase] = Field(default_factory=list, description="Expected URL parameters")


class EndpointCreate(EndpointBase):
    group_id: UUID


class EndpointUpdate(EndpointBase):
    pass


class Endpoint(EndpointBase):
    id: UUID
    group_id: UUID
    created_by_id: UUID

    class Config:
        from_attributes = True


class HeaderResponse(HeaderBase):
    id: str
    endpoint_id: str

    class Config:
        from_attributes = True


class UrlParameterResponse(UrlParameterBase):
    id: str
    endpoint_id: str

    class Config:
        from_attributes = True


class EndpointResponse(EndpointBase):
    id: str
    group_id: str
    created_by_id: str
    created_at: str
    updated_at: str
    deleted_at: Optional[str] = None
    created_at_epoch: int
    headers: List[HeaderResponse]
    url_parameters: List[UrlParameterResponse]

    class Config:
        from_attributes = True 