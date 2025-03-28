export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface Endpoint {
  id: string
  name: string
  description: string
  method: HttpMethod
  max_wait_time: number
  chaos_mode: boolean
  response_schema: Record<string, any>
  response_status_code: number
  response_body: string
  headers: any[]
  url_parameters: any[]
}

export interface Header {
  id: string
  endpoint_id: string
  name: string
  value: string
  required: boolean
  default_response: Record<string, any>
  default_status_code: number
}

export interface UrlParameter {
  id: string
  endpoint_id: string
  name: string
  value: string
  required: boolean
  default_response: Record<string, any>
  default_status_code: number
}

export interface CreateEndpointInput {
  name: string
  description: string
  max_wait_time: number
  chaos_mode: boolean
  response_schema: Record<string, any>
  response_status_code: number
  response_body: string
  headers?: Header[]
  url_parameters?: UrlParameter[]
}

export interface UpdateEndpointInput extends Partial<CreateEndpointInput> {} 