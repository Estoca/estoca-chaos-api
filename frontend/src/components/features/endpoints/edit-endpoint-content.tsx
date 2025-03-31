"use client"

import { useRouter } from "next/navigation"
import { EndpointForm } from "@/components/features/endpoints/endpoint-form"
import { useEndpoints } from "@/hooks/use-endpoints"
import { type UUID } from "@/types/endpoint"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface EditEndpointContentProps {
  groupId: UUID
  endpointId: UUID
}

export function EditEndpointContent({ groupId, endpointId }: EditEndpointContentProps) {
  const router = useRouter()
  const { endpoints, deleteEndpoint } = useEndpoints(groupId)
  const endpoint = endpoints.find((e) => e.id === endpointId)

  if (!endpoint) {
    return null
  }

  const handleDelete = async () => {
    try {
      await deleteEndpoint(endpointId)
      router.push(`/groups/${groupId}`)
    } catch (error) {
      console.error("Failed to delete endpoint:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Edit Endpoint</h3>
          <p className="text-sm text-muted-foreground">
            Update the endpoint configuration.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Endpoint</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the endpoint
                and all its associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="border-t">
        <EndpointForm
          groupId={groupId}
          endpointId={endpointId}
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