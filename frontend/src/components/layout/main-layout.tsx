"use client"

import { UserProfile } from "./user-profile"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col flex-1">
        <main className="flex-1">{children}</main>
        <div className="fixed bottom-4 right-4">
          <UserProfile />
        </div>
      </div>
    </div>
  )
} 