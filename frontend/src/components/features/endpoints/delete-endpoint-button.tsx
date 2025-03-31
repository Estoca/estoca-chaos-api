"use client"

import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

import { useEndpoints } from "@/hooks/use-endpoints"
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
import { type UUID } from "@/types/endpoint"

interface DeleteEndpointButtonProps {
  groupId: UUID
  endpointId: UUID
  endpointName: string // To display in the confirmation message
}

export function DeleteEndpointButton({
  groupId,
  endpointId,
  endpointName,
}: DeleteEndpointButtonProps) {
  const router = useRouter()
  // Get the delete function and loading state from the hook
  const { deleteEndpoint, isDeleting } = useEndpoints(groupId)

  const handleDelete = async () => {
    try {
      await deleteEndpoint({ groupId, endpointId })
      // Navigate back to the group detail page on successful deletion
      router.push(`/groups/${groupId}`)
      router.refresh() // Refresh server components if needed
    } catch (error) {
      // Error is already handled by the toast in useEndpoints hook
      console.error("Deletion failed in component:", error)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete Endpoint</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the endpoint 
            <span className="font-semibold">"{endpointName}"</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 