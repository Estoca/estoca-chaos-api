import { EndpointForm } from "@/components/features/endpoints/endpoint-form"
import { useEndpoints } from "@/hooks/use-endpoints"
import { type UUID } from "@/types/endpoint"

interface EditEndpointPageProps {
  params: {
    groupId: UUID
    endpointId: UUID
  }
}

export default function EditEndpointPage({ params }: EditEndpointPageProps) {
  const { endpoints } = useEndpoints(params.groupId)
  const endpoint = endpoints.find((e) => e.id === params.endpointId)

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
            path: endpoint.path,
            max_wait_time: endpoint.max_wait_time,
            chaos_mode: endpoint.chaos_mode,
            response_schema: JSON.stringify(endpoint.response_schema, null, 2),
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