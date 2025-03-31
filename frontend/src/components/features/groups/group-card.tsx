"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { type Group } from "@/types/group"

interface GroupCardProps {
  group: Group
}

export function GroupCard({ group }: GroupCardProps) {
  const router = useRouter()
  
  const handleCardClick = () => {
    router.push(`/groups/${group.id}`)
  }
  
  return (
    <Card 
      className="h-full transition-colors hover:bg-accent cursor-pointer"
      onClick={handleCardClick}
    >
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
  )
} 