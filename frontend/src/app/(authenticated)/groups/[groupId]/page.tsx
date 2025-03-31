"use client"

import { notFound } from "next/navigation"
import { EndpointList } from "@/components/features/endpoints/endpoint-list"
import { useGroup } from "@/hooks/use-group"
import { type UUID } from "@/types/endpoint"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import { EditGroupModal } from "@/components/features/groups/edit-group-modal"

interface GroupDetailPageProps {
  params: {
    groupId: UUID
  }
}

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { data: group, isLoading, isError, error } = useGroup(params.groupId)

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching Group</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "An unknown error occurred."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!group) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-2">
          <h1 className="text-3xl font-bold truncate">{group.name}</h1>
          <EditGroupModal group={group} />
        </div>
        <p className="text-muted-foreground">{group.description || "No description provided."}</p>
      </div>
      <EndpointList groupId={params.groupId} />
    </div>
  )
} 