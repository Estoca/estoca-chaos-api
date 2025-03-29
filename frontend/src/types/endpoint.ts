export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
export type UUID = string

export interface Endpoint {
  id: UUID
  name: string
  description: string
  path: string
  method: HttpMethod
  max_wait_time: number
  chaos_mode: boolean
  response_schema: Record<string, any>
  response_status_code: number
  response_body: string
  group_id: UUID
  created_by_id: UUID
  headers: Header[]
  url_parameters: UrlParameter[]
}

export interface Header {
  id: UUID
  endpoint_id: UUID
  name: string
  value: string
  required: boolean
  default_response: Record<string, any>
  default_status_code: number
}

export interface UrlParameter {
  id: UUID
  endpoint_id: UUID
  name: string
  value: string
  required: boolean
  default_response: Record<string, any>
  default_status_code: number
}

export interface CreateEndpointInput {
  name: string
  description: string
  path: string
  method: HttpMethod
  max_wait_time: number
  chaos_mode: boolean
  response_schema: Record<string, any>
  response_status_code: number
  response_body: string
  group_id: UUID
  headers?: Header[]
  url_parameters?: UrlParameter[]
}

export interface UpdateEndpointInput extends Partial<CreateEndpointInput> {} 