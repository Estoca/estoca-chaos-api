import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderOpen, Plus } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to Estoca Mock API</h1>
        <p className="text-muted-foreground">
          A powerful mock API application for testing system integrations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View and manage your mock API groups
            </p>
            <Link href="/groups">
              <Button>
                <FolderOpen className="mr-2 h-4 w-4" />
                View Groups
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create New Group</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Create a new group to organize your mock API endpoints
            </p>
            <Link href="/groups/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Group
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 