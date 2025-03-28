"use client"

import { useGroups } from "@/hooks/use-groups"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

export function GroupList() {
  const { groups, isLoading } = useGroups()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Groups</CardTitle>
          <CardDescription>
            Create your first group to get started with mock API endpoints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/groups/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <Link key={group.id} href={`/dashboard/groups/${group.id}`}>
          <Card className="h-full transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription>
                Created {formatDistanceToNow(new Date(group.created_at), { addSuffix: true })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{group.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
} 