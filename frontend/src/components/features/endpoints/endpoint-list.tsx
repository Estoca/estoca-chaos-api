"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEndpoints } from "@/hooks/use-endpoints"
import { type Endpoint } from "@/types/endpoint"
import { PlusIcon } from "lucide-react"

interface EndpointListProps {
  groupId: string
}

export function EndpointList({ groupId }: EndpointListProps) {
  const router = useRouter()
  const { endpoints, isLoading, deleteEndpoint } = useEndpoints(groupId)

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-4 w-full bg-muted rounded mb-2" />
              <div className="h-4 w-2/3 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (endpoints.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">No endpoints found</h3>
        <p className="text-muted-foreground mt-2">
          Create your first endpoint to get started.
        </p>
        <Button
          className="mt-4"
          onClick={() => router.push(`/groups/${groupId}/endpoints/new`)}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Endpoint
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Endpoints</h2>
          <p className="text-muted-foreground">
            Manage your endpoints in this group.
          </p>
        </div>
        <Link href={`/groups/${groupId}/endpoints/new`}>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Endpoint
          </Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {endpoints.map((endpoint: Endpoint) => (
          <Link
            key={endpoint.id}
            href={`/groups/${groupId}/endpoints/${endpoint.id}/edit`}
          >
            <Card className="hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{endpoint.name}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {endpoint.method}
                  </span>
                </CardTitle>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>Status: {endpoint.response_status_code}</p>
                  <p>Max Wait Time: {endpoint.max_wait_time}ms</p>
                  <p>Chaos Mode: {endpoint.chaos_mode ? "Enabled" : "Disabled"}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
} 