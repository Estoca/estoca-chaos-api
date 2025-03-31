"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useEndpoints } from "@/hooks/use-endpoints"
import { useGroups } from "@/hooks/use-groups"
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
import { type Group } from "@/types/group"

interface DeleteGroupButtonProps {
  group: Group
}

export function DeleteGroupButton({ group }: DeleteGroupButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { endpoints, isLoading: isLoadingEndpoints } = useEndpoints(group.id)
  const { deleteGroup } = useGroups()
  
  const hasNoEndpoints = !isLoadingEndpoints && endpoints.length === 0
  
  if (!hasNoEndpoints) {
    return null
  }
  
  const handleDelete = async () => {
    try {
      await deleteGroup(group.id)
      toast({
        title: "Group deleted",
        description: `${group.name} has been deleted successfully.`,
      })
      // Navigate back to groups list after deletion
      router.push("/groups")
    } catch (error) {
      console.error("Failed to delete group:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete group. Please try again.",
      })
    }
  }
  
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="default">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Group
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the group "{group.name}". This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 