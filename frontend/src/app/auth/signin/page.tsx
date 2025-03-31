"use client"

import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignIn() {
  const [callbackUrl, setCallbackUrl] = useState("/dashboard")

  useEffect(() => {
    // Check if there's a stored redirect path
    const storedRedirect = sessionStorage.getItem('redirectAfterLogin')
    if (storedRedirect) {
      setCallbackUrl(storedRedirect)
    }
  }, [])

  const handleSignIn = () => {
    signIn("google", { callbackUrl })
    // Clear the stored redirect path after use
    sessionStorage.removeItem('redirectAfterLogin')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Estoca Mock API</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          onClick={handleSignIn}
        >
          Sign in with Google
        </Button>
      </CardContent>
    </Card>
  )
} 