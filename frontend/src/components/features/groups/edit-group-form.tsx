"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

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
import { type Group } from "@/types/group"
import { cn } from "@/lib/utils"

// Zod schema for form validation
const formSchema = z.object({
  name: z
    .string()
    .min(1, "Group name is required")
    .regex(
      /^[a-z0-9_-]+$/,
      "Name can only contain lowercase letters, numbers, underscores, and hyphens (no spaces)"
    ),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EditGroupFormProps {
  initialData: Pick<Group, "name" | "description">
  onSubmit: (values: FormValues) => Promise<void>
  isSubmitting: boolean
  onCancel?: () => void // Optional cancel handler (e.g., to close modal)
}

export function EditGroupForm({
  initialData,
  onSubmit,
  isSubmitting,
  onCancel,
}: EditGroupFormProps) {
  const [nameError, setNameError] = useState<string | null>(null)
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name || "",
      description: initialData.description || "",
    },
  })

  const validateName = (value: string) => {
    if (!value) {
      setNameError("Name is required")
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
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
                <Textarea placeholder="Enter group description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 