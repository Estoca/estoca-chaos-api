"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Edit } from "lucide-react"

import { type Group } from "@/types/group"
import { updateGroup } from "@/services/api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { EditGroupForm } from "./edit-group-form"

interface EditGroupModalProps {
  group: Group
}

// 1. Define interface for mutation variables
interface UpdateGroupVariables {
  id: string
  data: { name: string; description?: string }
}

export function EditGroupModal({ group }: EditGroupModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { mutate: handleUpdateGroup, isPending } = useMutation<Group, Error, UpdateGroupVariables>({
    // 2. Adjust mutationFn to accept single variable object
    mutationFn: async (variables: UpdateGroupVariables) => {
      return await updateGroup(variables.id, variables.data)
    },
    onSuccess: (updatedGroup) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      queryClient.invalidateQueries({ queryKey: ["group", group.id] })
      // Optionally, update the cache directly for faster UI update
      queryClient.setQueryData(["group", group.id], updatedGroup)
      
      toast({
        title: "Group Updated",
        description: `Group "${updatedGroup.name}" has been updated successfully.`,
      })
      setIsOpen(false) // Close modal on success
    },
    onError: (error) => {
      toast({
        title: "Error Updating Group",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    },
  })

  const onSubmit = async (values: { name: string; description?: string }) => {
    // 3. Call handleUpdateGroup with the correct variable structure
    await handleUpdateGroup({ id: group.id, data: values })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit Group</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>
            Make changes to the group name and description.
          </DialogDescription>
        </DialogHeader>
        <EditGroupForm
          initialData={{ name: group.name, description: group.description }}
          onSubmit={onSubmit}
          isSubmitting={isPending}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
} 