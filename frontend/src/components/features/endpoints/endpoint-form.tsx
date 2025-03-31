"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useEndpoints } from "@/hooks/use-endpoints"
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
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ParameterList } from "./parameter-list"
import { safeJsonParse } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  path: z.string().min(1, "Path is required"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  max_wait_time: z.number().min(0),
  chaos_mode: z.boolean(),
  response_schema: z.string().optional(),
  response_status_code: z.number().min(100).max(599),
  response_body: z.string().optional(),
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
      path: "",
      method: "GET",
      max_wait_time: 0,
      chaos_mode: true,
      response_schema: "{}",
      response_status_code: 200,
      response_body: "",
      headers: [],
      url_parameters: [],
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      // Safely parse response schema
      const responseSchema = safeJsonParse(values.response_schema)
      
      // Normalize data to prevent serialization issues
      const sanitizedHeaders = values.headers.map(header => ({
        ...header,
        default_response: header.default_response || {},
      }))

      const sanitizedUrlParameters = values.url_parameters.map(param => ({
        ...param,
        default_response: param.default_response || {},
      }))

      const submitValues = {
        ...values,
        response_schema: responseSchema,
        description: values.description || "",
        response_body: values.response_body || "",
        headers: sanitizedHeaders,
        url_parameters: sanitizedUrlParameters,
      }

      if (endpointId) {
        await updateEndpoint({ id: endpointId, data: submitValues })
      } else {
        await createEndpoint(submitValues)
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
                <Textarea placeholder="Enter endpoint description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="path"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Path</FormLabel>
              <FormControl>
                <Input placeholder="Enter endpoint path" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select HTTP method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="max_wait_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Wait Time (seconds)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="Enter max wait time"
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
          name="chaos_mode"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Chaos Mode</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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
          name="response_schema"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Response Schema</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter response schema (JSON)"
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