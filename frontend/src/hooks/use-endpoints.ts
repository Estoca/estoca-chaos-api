import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import api from "@/lib/axios"

import {
  type CreateEndpointInput,
  type Endpoint,
  type UpdateEndpointInput,
} from "@/types/endpoint"

export function useEndpoints(groupId: string) {
  const queryClient = useQueryClient()

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
        throw error
      }
    },
  })

  const createEndpoint = useMutation({
    mutationFn: async (data: CreateEndpointInput) => {
      try {
        const response = await api.post<Endpoint>(
          `/groups/${groupId}/endpoints`,
          data
        )
        return response.data
      } catch (error) {
        console.error("Failed to create endpoint:", error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoints", groupId] })
    },
  })

  const updateEndpoint = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
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
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoints", groupId] })
    },
  })

  const deleteEndpoint = useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`/groups/${groupId}/endpoints/${id}`)
      } catch (error) {
        console.error("Failed to delete endpoint:", error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoints", groupId] })
    },
  })

  const testEndpoint = useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await api.post(
          `/groups/${groupId}/endpoints/${id}/test`
        )
        return response.data
      } catch (error) {
        console.error("Failed to test endpoint:", error)
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
    deleteEndpoint: deleteEndpoint.mutateAsync,
    testEndpoint: testEndpoint.mutateAsync,
  }
} 