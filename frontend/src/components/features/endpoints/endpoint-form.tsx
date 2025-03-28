"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useEndpoints } from "@/hooks/use-endpoints"
import { type Header, type HttpMethod, type UrlParameter } from "@/types/endpoint"
import { ParameterList } from "./parameter-list"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  max_wait_time: z.number().min(0, "Wait time must be 0 or greater"),
  chaos_mode: z.boolean().default(true),
  response_schema: z.record(z.any()),
  response_status_code: z.number().min(100).max(599),
  response_body: z.string(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"] as const),
  headers: z.array(z.any()).default([]),
  url_parameters: z.array(z.any()).default([]),
})

type FormValues = z.infer<typeof formSchema>

interface EndpointFormProps {
  groupId: string
  initialData?: FormValues
  endpointId?: string
}

export function EndpointForm({ groupId, initialData, endpointId }: EndpointFormProps) {
  const router = useRouter()
  const { createEndpoint, updateEndpoint, isLoading } = useEndpoints(groupId)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      max_wait_time: 0,
      chaos_mode: true,
      response_schema: {},
      response_status_code: 200,
      response_body: "",
      method: "GET",
      headers: [],
      url_parameters: [],
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      if (endpointId) {
        await updateEndpoint({ id: endpointId, data: values })
      } else {
        await createEndpoint(values)
      }
      router.push(`/groups/${groupId}`)
    } catch (error) {
      console.error("Failed to save endpoint:", error)
    }
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
                <Input placeholder="Enter endpoint name" {...field} />
              </FormControl>
              <FormMessage />
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
                  placeholder="Enter endpoint description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Method</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="max_wait_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Wait Time (ms)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="Enter max wait time in milliseconds"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="response_status_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Response Status Code</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={100}
                  max={599}
                  placeholder="Enter response status code"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="response_body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Response Body</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter response body"
                  className="resize-none font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="headers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Headers</FormLabel>
              <FormControl>
                <ParameterList
                  type="header"
                  items={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url_parameters"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Parameters</FormLabel>
              <FormControl>
                <ParameterList
                  type="parameter"
                  items={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : endpointId ? "Update Endpoint" : "Create Endpoint"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/groups/${groupId}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
} 