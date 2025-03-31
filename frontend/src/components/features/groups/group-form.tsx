"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useGroups } from "@/hooks/use-groups"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .regex(
      /^[a-z0-9_-]+$/,
      "Name can only contain lowercase letters, numbers, underscores, and hyphens (no spaces)"
    ),
  description: z.string().min(10, "Description must be at least 10 characters"),
})

type FormValues = z.infer<typeof formSchema>

export function GroupForm() {
  const router = useRouter()
  const { createGroup, isLoading } = useGroups()
  const [nameError, setNameError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      await createGroup(values)
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to create group:", error)
    }
  }

  const validateName = (value: string) => {
    if (!value) {
      setNameError("Name is required")
      return
    }
    
    if (value.length < 2) {
      setNameError("Name must be at least 2 characters")
      return
    }
    
    if (!/^[a-z0-9_-]+$/.test(value)) {
      setNameError("Name can only contain lowercase letters, numbers, underscores, and hyphens (no spaces)")
      return
    }
    
    setNameError(null)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter group name" 
                  className={cn(
                    nameError && "border-destructive focus-visible:ring-destructive"
                  )}
                  {...field} 
                  onChange={(e) => {
                    field.onChange(e)
                    // Clear errors when user types
                    if (nameError) {
                      setNameError(null)
                    }
                  }}
                  onBlur={(e) => {
                    field.onBlur()
                    validateName(e.target.value)
                  }}
                />
              </FormControl>
              <FormDescription>
                Name can only contain lowercase letters, numbers, underscores, and hyphens (e.g., "my-group" or "test_group").
              </FormDescription>
              {nameError ? (
                <div className="text-sm font-medium text-destructive">{nameError}</div>
              ) : (
                <FormMessage />
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter group description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Group"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
} 