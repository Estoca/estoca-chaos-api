"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { signOut, useSession } from "next-auth/react"
import { Home, LogOut, FolderOpen } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

function getInitials(name?: string | null): string {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Groups",
      href: "/groups",
      icon: FolderOpen,
    },
  ]

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Estoca Mock API</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="border-t p-3 flex items-center justify-between">
        {session?.user ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
              <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
            </Avatar>
            <div className="text-sm overflow-hidden">
              <p className="font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-8"></div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={() => signOut()}
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Sign Out</span>
        </Button>
      </div>
    </div>
  )
} 