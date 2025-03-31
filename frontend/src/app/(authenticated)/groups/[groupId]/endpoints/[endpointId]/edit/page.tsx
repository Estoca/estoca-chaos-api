import { EditEndpointContent } from "@/components/features/endpoints/edit-endpoint-content"
import { type UUID } from "@/types/endpoint"

interface EditEndpointPageProps {
  params: {
    groupId: UUID
    endpointId: UUID
  }
}

export default function EditEndpointPage({ params }: EditEndpointPageProps) {
  return <EditEndpointContent groupId={params.groupId} endpointId={params.endpointId} />
} 