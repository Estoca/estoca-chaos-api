import { EndpointForm } from "@/components/features/endpoints/endpoint-form"

interface NewEndpointPageProps {
  params: {
    groupId: string
  }
}

export default function NewEndpointPage({ params }: NewEndpointPageProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Endpoint</h1>
        <p className="text-muted-foreground">
          Create a new endpoint to handle mock API requests.
        </p>
      </div>
      <div className="max-w-2xl">
        <EndpointForm groupId={params.groupId} />
      </div>
    </div>
  )
} 