import { useQuery } from "@tanstack/react-query"
import { getEndpoint } from "@/services/api"
import { type Endpoint, type UUID } from "@/types/endpoint"

interface UseEndpointProps {
  groupId: UUID | undefined
  endpointId: UUID | undefined
}

export function useEndpoint({ groupId, endpointId }: UseEndpointProps) {
  return useQuery<Endpoint, Error>({
    queryKey: ["endpoint", groupId, endpointId], // Unique key for this specific endpoint
    queryFn: () => {
      if (!groupId || !endpointId) {
        // Should not happen if enabled is working, but prevents type errors
        return Promise.reject(new Error("Missing groupId or endpointId"));
      }
      return getEndpoint({ groupId, endpointId })
    },
    enabled: !!groupId && !!endpointId, // Only run query if both IDs are present
    staleTime: 5 * 60 * 1000, // Optional: Cache data for 5 minutes
  })
} 