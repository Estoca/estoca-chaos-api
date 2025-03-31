import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"
import api from "@/lib/axios"
import { deleteEndpoint } from "@/services/api"

import {
  type CreateEndpointInput,
  type Endpoint,
  type UpdateEndpointInput,
  type UUID,
} from "@/types/endpoint"

interface DeleteEndpointVariables {
  groupId: UUID
  endpointId: UUID
}

export function useEndpoints(groupId: UUID) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: endpoints = [], isLoading, error } = useQuery({
    queryKey: ["endpoints", groupId],
    queryFn: async () => {
      try {
        const response = await api.get<Endpoint[]>(
          `/groups/${groupId}/endpoints`
        )
        return response.data
      } catch (error) {
        console.error("Failed to fetch endpoints:", error)
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.detail || "Failed to fetch endpoints"
          toast({
            variant: "destructive",
            title: "Error",
            description: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch endpoints",
          })
        }
        throw error
      }
    },
  })

  const createEndpoint = useMutation({
    mutationFn: async (data: Omit<CreateEndpointInput, "group_id">) => {
      try {
        const response = await api.post<Endpoint>(
          `/groups/${groupId}/endpoints`,
          { ...data, group_id: groupId }
        )
        return response.data
      } catch (error) {
        console.error("Failed to create endpoint:", error)
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.detail || "Failed to create endpoint"
          toast({
            variant: "destructive",
            title: "Error",
            description: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create endpoint",
          })
        }
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoints", groupId] })
      toast({
        title: "Success",
        description: "Endpoint created successfully",
      })
    },
  })

  const updateEndpoint = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: UUID
      data: UpdateEndpointInput
    }) => {
      try {
        const response = await api.put<Endpoint>(
          `/groups/${groupId}/endpoints/${id}`,
          data
        )
        return response.data
      } catch (error) {
        console.error("Failed to update endpoint:", error)
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.detail || "Failed to update endpoint"
          toast({
            variant: "destructive",
            title: "Error",
            description: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update endpoint",
          })
        }
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoints", groupId] })
      toast({
        title: "Success",
        description: "Endpoint updated successfully",
      })
    },
  })

  const deleteEndpointMutate = useMutation<void, Error, DeleteEndpointVariables>({
    mutationFn: deleteEndpoint,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["endpoints", variables.groupId] })
      toast({
        title: "Endpoint Deleted",
        description: "The endpoint has been successfully deleted.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error Deleting Endpoint",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    },
  })

  const testEndpoint = useMutation({
    mutationFn: async (id: UUID) => {
      try {
        const response = await api.post(
          `/groups/${groupId}/endpoints/${id}/test`
        )
        return response.data
      } catch (error) {
        console.error("Failed to test endpoint:", error)
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.detail || "Failed to test endpoint"
          toast({
            variant: "destructive",
            title: "Error",
            description: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to test endpoint",
          })
        }
        throw error
      }
    },
  })

  return {
    endpoints,
    isLoading,
    error,
    createEndpoint: createEndpoint.mutateAsync,
    updateEndpoint: updateEndpoint.mutateAsync,
    deleteEndpoint: deleteEndpointMutate.mutateAsync,
    testEndpoint: testEndpoint.mutateAsync,
    isDeleting: deleteEndpointMutate.isPending,
  }
} 