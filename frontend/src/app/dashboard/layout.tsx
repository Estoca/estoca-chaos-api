"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    redirect("/auth/signin")
  }

  return <MainLayout>{children}</MainLayout>
} 