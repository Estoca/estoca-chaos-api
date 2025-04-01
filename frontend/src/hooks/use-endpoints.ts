import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"
import { deleteEndpoint, updateEndpoint } from "@/services/api"
import api from "@/lib/axios"

import {
  type Endpoint,
  type EndpointCreate,
  type EndpointUpdate,
  type UUID,
} from "@/types/endpoint"

interface DeleteEndpointVariables {
  groupId: UUID
  endpointId: UUID
}

interface UpdateEndpointVariables {
  groupId: UUID
  endpointId: UUID
  data: EndpointUpdate
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

  const { mutate: createEndpointMutate, isPending: isCreating } = useMutation<Endpoint, Error, EndpointCreate>({
    mutationFn: async (data: EndpointCreate) => {
      try {
        const response = await api.post<Endpoint>(
          `/groups/${groupId}/endpoints/`,
          data
        )
        return response.data
      } catch (error) {
        console.error("Failed to create endpoint:", error)
        if (axios.isAxiosError(error)) {
          const errorMessage =
            error.response?.data?.detail || "Failed to create endpoint"
          toast({
            variant: "destructive",
            title: "Error",
            description:
              typeof errorMessage === "string"
                ? errorMessage
                : JSON.stringify(errorMessage),
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "An unknown error occurred while creating the endpoint.",
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

  const { mutate: updateEndpointMutate, isPending: isUpdating } = useMutation<Endpoint, Error, UpdateEndpointVariables>({
    mutationFn: updateEndpoint,
    onSuccess: (updatedEndpoint) => {
      queryClient.invalidateQueries({ queryKey: ["endpoints", groupId] })
      queryClient.setQueryData(["endpoint", groupId, updatedEndpoint.id], updatedEndpoint)
      toast({ title: "Endpoint Updated" })
    },
    onError: (error) => {
      toast({ title: "Error Updating Endpoint", description: error.message, variant: "destructive" })
    }
  })

  const { mutate: deleteEndpointMutate, isPending: isDeleting } = useMutation<void, Error, DeleteEndpointVariables>({
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
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    },
  })

  return {
    endpoints,
    isLoading,
    error,
    createEndpoint: createEndpointMutate,
    isCreating,
    updateEndpoint: updateEndpointMutate,
    isUpdating,
    deleteEndpoint: deleteEndpointMutate,
    isDeleting,
  }
} 