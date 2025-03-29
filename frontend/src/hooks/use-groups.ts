import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import api from "@/lib/axios"
import axios from "axios"

import { type Group } from "@/types/group"
import { type UUID } from "@/types/endpoint"

export function useGroups() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      try {
        const response = await api.get<Group[]>("/groups")
        return response.data
      } catch (error: unknown) {
        console.error("Failed to fetch groups:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch groups",
        })
        throw error
      }
    },
  })

  const createGroup = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      try {
        const response = await api.post<Group>("/groups", data)
        return response.data
      } catch (error: unknown) {
        console.error("Failed to create group:", error)
        if (axios.isAxiosError(error)) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.response?.data?.detail || "Failed to create group",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create group",
          })
        }
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      toast({
        title: "Success",
        description: "Group created successfully",
      })
    },
  })

  const updateGroup = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: UUID
      data: { name: string; description: string }
    }) => {
      try {
        const response = await api.put<Group>(`/groups/${id}`, data)
        return response.data
      } catch (error: unknown) {
        console.error("Failed to update group:", error)
        if (axios.isAxiosError(error)) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.response?.data?.detail || "Failed to update group",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update group",
          })
        }
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      toast({
        title: "Success",
        description: "Group updated successfully",
      })
    },
  })

  const deleteGroup = useMutation({
    mutationFn: async (id: UUID) => {
      try {
        await api.delete(`/groups/${id}`)
      } catch (error: unknown) {
        console.error("Failed to delete group:", error)
        if (axios.isAxiosError(error)) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.response?.data?.detail || "Failed to delete group",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete group",
          })
        }
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      toast({
        title: "Success",
        description: "Group deleted successfully",
      })
    },
  })

  return {
    groups,
    isLoading,
    createGroup: createGroup.mutateAsync,
    updateGroup: updateGroup.mutateAsync,
    deleteGroup: deleteGroup.mutateAsync,
  }
} 