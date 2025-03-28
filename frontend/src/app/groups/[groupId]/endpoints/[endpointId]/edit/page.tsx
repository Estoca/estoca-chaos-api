import { EndpointForm } from "@/components/features/endpoints/endpoint-form"
import { useEndpoints } from "@/hooks/use-endpoints"

interface Endpoint {
  id: string
  name: string
  description: string
  max_wait_time: number
  chaos_mode: boolean
  response_schema: Record<string, any>
  response_status_code: number
  response_body: string
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  headers: any[]
  url_parameters: any[]
}

interface EditEndpointPageProps {
  params: {
    groupId: string
    endpointId: string
  }
}

export default function EditEndpointPage({ params }: EditEndpointPageProps) {
  const { endpoints } = useEndpoints(params.groupId)
  const endpoint = endpoints.find((e: { id: string }) => e.id === params.endpointId) as Endpoint | undefined

  if (!endpoint) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Endpoint</h3>
        <p className="text-sm text-muted-foreground">
          Update the endpoint configuration.
        </p>
      </div>
      <div className="border-t">
        <EndpointForm
          groupId={params.groupId}
          endpointId={params.endpointId}
          initialData={{
            name: endpoint.name,
            description: endpoint.description,
            max_wait_time: endpoint.max_wait_time,
            chaos_mode: endpoint.chaos_mode,
            response_schema: endpoint.response_schema,
            response_status_code: endpoint.response_status_code,
            response_body: endpoint.response_body,
            method: endpoint.method,
            headers: endpoint.headers || [],
            url_parameters: endpoint.url_parameters || [],
          }}
        />
      </div>
    </div>
  )
} 