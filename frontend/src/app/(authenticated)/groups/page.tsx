import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { GroupList } from "@/components/features/groups/group-list";

export default function GroupsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Groups</h1>
        <Link href="/groups/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Group
          </Button>
        </Link>
      </div>

      <GroupList />
    </div>
  );
} 