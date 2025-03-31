export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
export type UUID = string

// --- Base types mirroring Pydantic Schemas ---

interface HeaderBase {
  name: string
  value: string
  required?: boolean
  default_response?: Record<string, any>
  default_status_code?: number
}

interface UrlParameterBase {
  name: string
  value: string
  required?: boolean
  default_response?: Record<string, any>
  default_status_code?: number
}

// Define EndpointBase mirroring Pydantic
export interface EndpointBase {
  name: string
  description?: string | null
  path: string
  method: HttpMethod
  max_wait_time?: number
  chaos_mode?: boolean
  response_type?: "fixed" | "dynamic" // Added in form, ensure it matches if needed by API
  response_schema?: Record<string, any> | null
  response_status_code?: number
  response_body?: string | null
  request_body_schema?: Record<string, any> | null
  headers?: HeaderBase[]
  url_parameters?: UrlParameterBase[]
}

// Define EndpointCreate
export interface EndpointCreate extends EndpointBase {
  group_id: UUID
}

// Define EndpointUpdate (can be partial of Base for PUT)
// Using EndpointBase directly implies all fields are sent on PUT
// If using PATCH, a Partial<EndpointBase> might be more appropriate
export type EndpointUpdate = EndpointBase; 
// Alternatively for PATCH: export type EndpointUpdate = Partial<EndpointBase>;

// --- Types with DB fields ---

export interface Header extends HeaderBase {
  id: UUID
  endpoint_id: UUID // Added for completeness
}

export interface UrlParameter extends UrlParameterBase {
  id: UUID
  endpoint_id: UUID // Added for completeness
}

export interface Endpoint extends EndpointBase {
  id: UUID
  group_id: UUID
  created_by_id: UUID
  // response_schema and request_body_schema are already in EndpointBase
  headers: Header[] // Use Header type with id
  url_parameters: UrlParameter[] // Use UrlParameter type with id
  created_at: string
  updated_at: string
  deleted_at?: string | null
  created_at_epoch: number
}

// Potentially redundant if API returns full Endpoint object
export interface EndpointResponse extends Omit<Endpoint, 'group_id'> {
  group: { 
    id: UUID
    name: string
  }
} 