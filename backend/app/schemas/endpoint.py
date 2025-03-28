from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


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
    name: str = Field(..., description="Name of the endpoint")
    description: Optional[str] = Field(None, description="Description of the endpoint")
    max_wait_time: int = Field(0, description="Maximum time to wait before response (in seconds)")
    chaos_mode: bool = Field(True, description="Whether chaos mode is enabled")
    response_schema: Dict[str, Any] = Field(..., description="JSON Schema for response generation")
    response_status_code: int = Field(200, description="HTTP status code for successful response")
    response_body: Optional[str] = Field(None, description="Static response body (if not using schema)")
    headers: List[HeaderBase] = Field(default_factory=list, description="Expected headers")
    url_parameters: List[UrlParameterBase] = Field(default_factory=list, description="Expected URL parameters")


class EndpointCreate(EndpointBase):
    pass


class EndpointUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    max_wait_time: Optional[int] = None
    chaos_mode: Optional[bool] = None
    response_schema: Optional[Dict[str, Any]] = None
    response_status_code: Optional[int] = None
    response_body: Optional[str] = None
    headers: Optional[List[HeaderBase]] = None
    url_parameters: Optional[List[UrlParameterBase]] = None


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