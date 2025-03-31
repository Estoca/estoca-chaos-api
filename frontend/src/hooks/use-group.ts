import { useQuery } from "@tanstack/react-query"
import { getGroup } from "@/services/api"
import { type UUID } from "@/types/endpoint"

export function useGroup(groupId: UUID) {
  return useQuery({
    queryKey: ["group", groupId], // Unique key for this specific group
    queryFn: () => getGroup(groupId),
    enabled: !!groupId, // Only run the query if groupId is truthy
    staleTime: 5 * 60 * 1000, // Optional: Cache data for 5 minutes
  })
} 