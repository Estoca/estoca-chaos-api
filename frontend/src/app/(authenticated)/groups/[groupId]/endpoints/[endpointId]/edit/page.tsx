"use client"

import { EndpointForm, type FormValues } from "@/components/features/endpoints/endpoint-form"
import { useEndpoint } from "@/hooks/use-endpoint"
import { type UUID } from "@/types/endpoint"
import { safeJsonStringify } from "@/lib/utils"
import { DeleteEndpointButton } from "@/components/features/endpoints/delete-endpoint-button"
import { notFound } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

interface EditEndpointPageProps {
  params: {
    groupId: UUID
    endpointId: UUID
  }
}

export default function EditEndpointPage({ params }: EditEndpointPageProps) {
  const { 
    data: endpoint, 
    isLoading, 
    isError, 
    error 
  } = useEndpoint({ groupId: params.groupId, endpointId: params.endpointId })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-6 w-1/4 mb-1" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="border-t">
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
        <div className="pt-6 border-t border-destructive/50">
          <Skeleton className="h-5 w-1/5 mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    )
  }

  if (isError) {
    if (error?.message?.includes('not found') || error?.message?.includes('404')) {
        notFound();
    }
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Endpoint</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "An unknown error occurred."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  
  if (!endpoint) {
    notFound()
  }

  const initialData: FormValues = {
    name: endpoint.name,
    description: endpoint.description || "",
    path: endpoint.path,
    method: endpoint.method,
    max_wait_time: endpoint.max_wait_time ?? 0,
    chaos_mode: endpoint.chaos_mode ?? true,
    response_status_code: endpoint.response_status_code ?? 200,
    response_body: endpoint.response_body || "",
    response_type: (endpoint.response_schema && Object.keys(endpoint.response_schema).length > 0) 
                    ? "dynamic" 
                    : "fixed",
    response_schema: (!endpoint.response_schema || Object.keys(endpoint.response_schema).length === 0)
                      ? "" 
                      : safeJsonStringify(endpoint.response_schema),
    request_body_schema: (!endpoint.request_body_schema || Object.keys(endpoint.request_body_schema).length === 0)
                        ? "" 
                        : safeJsonStringify(endpoint.request_body_schema),
    headers: endpoint.headers || [],
    url_parameters: endpoint.url_parameters || [],
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Endpoint</h3>
        <p className="text-sm text-muted-foreground">
          Update the endpoint configuration for <span className="font-semibold">{endpoint.name}</span>.
        </p>
      </div>
      <div className="border-t">
        <EndpointForm
          groupId={params.groupId}
          endpointId={params.endpointId}
          initialData={initialData}
        />
      </div>
      <div className="pt-6 border-t border-destructive/50">
        <h4 className="text-md font-medium text-destructive mb-2">Danger Zone</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Deleting this endpoint cannot be undone.
        </p>
        <DeleteEndpointButton 
          groupId={params.groupId} 
          endpointId={params.endpointId} 
          endpointName={endpoint.name}
        />
      </div>
    </div>
  )
} 