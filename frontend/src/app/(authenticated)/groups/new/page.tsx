import { GroupForm } from "@/components/features/groups/group-form"

export default function NewGroupPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Group</h1>
        <p className="text-muted-foreground">
          Create a new group to organize your mock API endpoints.
        </p>
      </div>
      <div className="max-w-2xl">
        <GroupForm />
      </div>
    </div>
  )
} 