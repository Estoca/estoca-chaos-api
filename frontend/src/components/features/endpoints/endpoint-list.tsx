"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEndpoints } from "@/hooks/use-endpoints"
import { type Endpoint, type UUID } from "@/types/endpoint"
import { PlusIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { CurlCommandModal } from "./curl-command-modal"

interface EndpointListProps {
  groupId: UUID
}

// Add a new EndpointCard component to better handle click events
function EndpointCard({ endpoint, groupId, apiBaseUrl }: { endpoint: Endpoint, groupId: UUID, apiBaseUrl: string }) {
  const router = useRouter();
  
  const handleCardClick = () => {
    router.push(`/groups/${groupId}/endpoints/${endpoint.id}/edit`);
  };
  
  return (
    <div className="relative">
      <Card className="hover:bg-muted/50 cursor-pointer" onClick={handleCardClick}>
        <CurlCommandModal 
          endpoint={endpoint} 
          apiBaseUrl={apiBaseUrl}
          groupId={groupId}
        />
        
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{endpoint.name}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {endpoint.method}
            </span>
          </CardTitle>
          <CardDescription>{endpoint.description}</CardDescription>
          <div className="mt-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Path:</span>
            <p className="text-sm font-mono break-all">/{endpoint.path}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p>Status: {endpoint.response_status_code}</p>
            <p>Max Wait Time: {endpoint.max_wait_time}ms</p>
            <p>Chaos Mode: {endpoint.chaos_mode ? "Enabled" : "Disabled"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function EndpointList({ groupId }: EndpointListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { endpoints, isLoading, error } = useEndpoints(groupId)
  
  // Get the API base URL from environment variables or use a default
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8033/api/v1"

  if (error) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-destructive">Error loading endpoints</h3>
        <p className="text-muted-foreground mt-2">
          There was an error loading the endpoints. Please try again later.
        </p>
        <Button
          className="mt-4"
          onClick={() => router.refresh()}
        >
          Retry
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
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
          <EndpointCard 
            key={endpoint.id}
            endpoint={endpoint}
            groupId={groupId}
            apiBaseUrl={apiBaseUrl}
          />
        ))}
      </div>
    </div>
  )
} 