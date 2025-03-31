"use client"

import { notFound } from "next/navigation"
import { EndpointList } from "@/components/features/endpoints/endpoint-list"
import { useGroups } from "@/hooks/use-groups"
import { type UUID } from "@/types/endpoint"
import { Skeleton } from "@/components/ui/skeleton"

interface GroupDetailPageProps {
  params: {
    groupId: UUID
  }
}

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { groups, isLoading } = useGroups()

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const group = groups.find((g) => g.id === params.groupId)

  if (!group) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{group.name}</h1>
        <p className="text-muted-foreground">{group.description}</p>
      </div>
      <EndpointList groupId={params.groupId} />
    </div>
  )
} 