"use client"

import { notFound } from "next/navigation"
import { EndpointList } from "@/components/features/endpoints/endpoint-list"
import { useGroups } from "@/hooks/use-groups"
import { type UUID } from "@/types/endpoint"

interface GroupDetailPageProps {
  params: {
    groupId: UUID
  }
}

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { groups } = useGroups()
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