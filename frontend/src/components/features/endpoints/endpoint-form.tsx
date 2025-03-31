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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ParameterList } from "./parameter-list"
import { generateExampleFromSchema, safeJsonParse } from "@/lib/utils"
import { Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  path: z.string().min(1, "Path is required"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  max_wait_time: z.number().min(0),
  chaos_mode: z.boolean(),
  response_type: z.enum(["fixed", "dynamic"]),
  response_schema: z.string().optional(),
  response_status_code: z.number().min(100).max(599),
  response_body: z.string().optional(),
  request_body_schema: z.string().optional(),
  headers: z.array(z.any()).default([]),
  url_parameters: z.array(z.any()).default([]),
})

// Export the inferred type
export type FormValues = z.infer<typeof formSchema>

interface EndpointFormProps {
  groupId: string
  initialData?: FormValues
  endpointId?: string
}

export function EndpointForm({ groupId, initialData, endpointId }: EndpointFormProps) {
  const router = useRouter()
  const { createEndpoint, updateEndpoint, isLoading } = useEndpoints(groupId)
  const { toast } = useToast()
  const [exampleDialogOpen, setExampleDialogOpen] = useState(false)
  const [exampleJson, setExampleJson] = useState("")
  const [exampleTitle, setExampleTitle] = useState("")
  const [schemaErrors, setSchemaErrors] = useState<{
    response_schema?: string;
    request_body_schema?: string;
  }>({})

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      path: "",
      method: "GET",
      max_wait_time: 0,
      chaos_mode: true,
      response_type: "fixed",
      response_schema: "",
      response_status_code: 200,
      response_body: "",
      request_body_schema: "",
      headers: [],
      url_parameters: [],
    },
  })

  const watchedResponseType = form.watch("response_type")
  const watchedMethod = form.watch("method")

  const handleValidateJson = (fieldName: "response_schema" | "request_body_schema") => {
    const jsonString = form.getValues(fieldName)
    if (!jsonString) {
      toast({ title: "Info", description: "Field is empty." })
      return
    }
    
    try {
      JSON.parse(jsonString)
      
      // Clear any existing error
      setSchemaErrors(prev => ({
        ...prev,
        [fieldName]: undefined
      }))
      
      toast({ title: "Success", description: "JSON syntax is valid." })
    } catch (error) {
      // Set error state for invalid JSON
      setSchemaErrors(prev => ({
        ...prev,
        [fieldName]: error instanceof Error ? error.message : "Invalid JSON syntax."
      }))
      
      toast({
        title: "Invalid JSON",
        description: error instanceof Error ? error.message : "Unknown syntax error.",
        variant: "destructive",
      })
    }
  }

  const handleGenerateExample = (fieldName: "response_schema" | "request_body_schema") => {
    const jsonString = form.getValues(fieldName);
    if (!jsonString) {
      toast({ title: "Info", description: "Field is empty." });
      return;
    }
    
    try {
      const schema = JSON.parse(jsonString);
      const example = generateExampleFromSchema(schema);
      
      // Set dialog title based on field
      setExampleTitle(fieldName === "response_schema" 
        ? "Example Response" 
        : "Example Request Body");
      
      // Set example JSON for the dialog
      setExampleJson(JSON.stringify(example, null, 2));
      
      // Open the dialog
      setExampleDialogOpen(true);
      
      // Clear any existing error
      setSchemaErrors(prev => ({
        ...prev,
        [fieldName]: undefined
      }))
    } catch (error) {
      // Set error state
      setSchemaErrors(prev => ({
        ...prev,
        [fieldName]: error instanceof Error ? error.message : "Invalid JSON syntax."
      }))
      
      toast({
        title: "Invalid JSON",
        description: error instanceof Error ? error.message : "Unknown syntax error.",
        variant: "destructive",
      })
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      // Check for JSON validity before submitting
      let hasErrors = false;
      
      if (values.response_type === "dynamic" && values.response_schema) {
        try {
          JSON.parse(values.response_schema);
        } catch (error) {
          setSchemaErrors(prev => ({
            ...prev,
            response_schema: error instanceof Error ? error.message : "Invalid JSON syntax."
          }));
          hasErrors = true;
        }
      }
      
      if (["POST", "PUT", "PATCH"].includes(values.method) && values.request_body_schema) {
        try {
          JSON.parse(values.request_body_schema);
        } catch (error) {
          setSchemaErrors(prev => ({
            ...prev,
            request_body_schema: error instanceof Error ? error.message : "Invalid JSON syntax."
          }));
          hasErrors = true;
        }
      }
      
      if (hasErrors) {
        toast({
          title: "Invalid JSON",
          description: "Please fix the JSON syntax errors before submitting.",
          variant: "destructive",
        });
        return;
      }
      
      // 2. Conditionally nullify inactive field data before processing/sending
      let finalResponseBody = values.response_body
      let finalResponseSchemaString = values.response_schema

      if (values.response_type === "fixed") {
        finalResponseSchemaString = undefined // Ignore schema if type is fixed
      } else if (values.response_type === "dynamic") {
        finalResponseBody = undefined // Ignore body if type is dynamic
      }

      // Safely parse potentially modified schema string
      const responseSchema = finalResponseSchemaString 
        ? safeJsonParse(finalResponseSchemaString) 
        : undefined;
        
      const requestBodySchema = values.request_body_schema
        ? safeJsonParse(values.request_body_schema)
        : undefined;

      // Normalize data to prevent serialization issues
      const sanitizedHeaders = values.headers.map(header => ({
        name: header.name,
        value: header.value,
        required: header.required || false,
        default_response: header.default_response || undefined, // Use undefined if needed
        default_status_code: header.default_status_code || undefined,
      }))

      const sanitizedUrlParameters = values.url_parameters.map(param => ({
        name: param.name,
        value: param.value,
        required: param.required || false,
        default_response: param.default_response || undefined,
        default_status_code: param.default_status_code || undefined,
      }))

      // Prepare the core data payload matching EndpointBase/EndpointUpdate type
      const endpointPayload = {
        name: values.name,
        description: values.description || null,
        path: values.path,
        method: values.method,
        max_wait_time: values.max_wait_time,
        chaos_mode: values.chaos_mode,
        response_type: values.response_type,
        response_schema: responseSchema, // Use parsed schema
        response_status_code: values.response_status_code,
        response_body: finalResponseBody || null, // Use potentially nulled body
        request_body_schema: requestBodySchema, // Use parsed schema
        headers: sanitizedHeaders,
        url_parameters: sanitizedUrlParameters,
      }

      if (endpointId) {
        // Correct structure for updateEndpoint mutation
        await updateEndpoint({ 
          groupId: groupId, // groupId is from props
          endpointId: endpointId, 
          data: endpointPayload // Pass the prepared payload
        })
      } else {
        // Correct structure for createEndpoint mutation
        await createEndpoint({
          ...endpointPayload,
          group_id: groupId // Add required group_id
        })
      }

      router.push(`/groups/${groupId}`)
    } catch (error) {
      console.error("Failed to save endpoint:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save endpoint",
        variant: "destructive",
      })
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
          name="response_type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Response Content Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="fixed" />
                    </FormControl>
                    <FormLabel className="font-normal">Fixed Response Body</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="dynamic" />
                    </FormControl>
                    <div className="flex items-center gap-1">
                      <FormLabel className="font-normal">Dynamic Schema-Based Response</FormLabel>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button type="button" variant="ghost" size="icon" className="h-4 w-4 text-muted-foreground hover:text-foreground">
                            <Info className="h-3 w-3" />
                            <span className="sr-only">Schema Info</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Response Schema Information</DialogTitle>
                            <DialogDescription>
                              Define the structure and data types for randomly generated responses using standard JSON Schema.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3 text-sm py-4">
                            <p>
                              The schema determines the shape of the JSON returned by this endpoint when 'Dynamic' mode is selected.
                            </p>
                            <p>
                              You can leverage the <code className="font-mono bg-muted px-1 rounded">Faker</code> library for realistic random data by adding a <code className="font-mono bg-muted px-1 rounded">$provider</code> property to string fields.
                            </p>
                            <div>
                              <p className="font-medium mb-1">Example:</p>
                              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{`{
  "type": "object",
  "properties": {
    "userId": { "type": "integer" },
    "name": {
      "type": "string",
      "$provider": "faker.name"
    },
    "email": {
      "type": "string",
      "format": "email",
      "$provider": "faker.email"
    },
    "lastLogin": {
      "type": "string",
      "format": "date-time",
      "$provider": "faker.iso8601"
    }
  },
  "required": ["userId", "name", "email"]
}`}
                              </pre>
                            </div>
                            <p>
                              See the <a href="https://faker.readthedocs.io/en/master/providers.html" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">Faker documentation</a> for a full list of available providers.
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {watchedResponseType === "dynamic" && (
          <FormField
            control={form.control}
            name="response_schema"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Response Schema (JSON)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea
                      placeholder='Enter the JSON schema for the response body. Example: { "type": "object", "properties": { "id": { "type": "integer" }, "name": { "type": "string", "$provider": "faker.name" } }, "required": ["id", "name"] }'
                      className={cn(
                        "resize-y min-h-[150px] font-mono",
                        schemaErrors.response_schema && "border-destructive focus-visible:ring-destructive"
                      )}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // Clear errors when user types
                        if (schemaErrors.response_schema) {
                          const newErrors = { ...schemaErrors };
                          delete newErrors.response_schema;
                          setSchemaErrors(newErrors);
                        }
                      }}
                      onBlur={() => {
                        // Validate JSON on blur
                        const jsonString = field.value;
                        if (!jsonString) return;
                        
                        try {
                          JSON.parse(jsonString);
                          // Clear any existing error on success
                          if (schemaErrors.response_schema) {
                            const newErrors = { ...schemaErrors };
                            delete newErrors.response_schema;
                            setSchemaErrors(newErrors);
                          }
                        } catch (error) {
                          // Set error state for invalid JSON
                          setSchemaErrors(prev => ({
                            ...prev,
                            response_schema: error instanceof Error ? error.message : "Invalid JSON syntax."
                          }));
                        }
                      }}
                    />
                    {schemaErrors.response_schema && (
                      <div className="text-xs text-destructive mt-1">
                        {schemaErrors.response_schema}
                      </div>
                    )}
                  </div>
                </FormControl>
                <div className="flex justify-end mt-1 space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleGenerateExample("response_schema")}
                  >
                    Generate Example
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleValidateJson("response_schema")}
                  >
                    Validate JSON
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {watchedResponseType === "fixed" && (
          <FormField
            control={form.control}
            name="response_body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Response Body</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter fixed response body (JSON, XML, text, etc.)"
                    className="resize-y min-h-[150px] font-mono"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {watchedMethod && ["POST", "PUT", "PATCH"].includes(watchedMethod) && (
          <FormField
            control={form.control}
            name="request_body_schema"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-1">
                  <FormLabel>Request Body Schema (JSON)</FormLabel>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="h-4 w-4 text-muted-foreground hover:text-foreground">
                        <Info className="h-3 w-3" />
                        <span className="sr-only">Request Body Schema Info</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Request Body Schema Information</DialogTitle>
                        <DialogDescription>
                          Define a JSON Schema to validate the structure and data types of incoming request bodies for POST, PUT, or PATCH methods.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 text-sm py-4">
                        <p>
                          If a request with method POST, PUT, or PATCH is received and its body does not conform to this schema, a 400 Bad Request error will be returned.
                        </p>
                        <p>
                          Leave this empty if you don't need request body validation for this endpoint.
                        </p>
                        <div>
                          <p className="font-medium mb-1">Example:</p>
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{`{
  "type": "object",
  "properties": {
    "userName": { "type": "string" },
    "items": {
      "type": "array",
      "items": { "type": "integer" }
    }
  },
  "required": ["userName", "items"]
}`}
                          </pre>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <FormControl>
                  <div className="relative">
                    <Textarea
                      placeholder='Enter the JSON schema to validate the incoming request body for POST/PUT/PATCH. Example: { "type": "object", "properties": { "userId": { "type": "integer" } }, "required": ["userId"] }'
                      className={cn(
                        "resize-y min-h-[150px] font-mono",
                        schemaErrors.request_body_schema && "border-destructive focus-visible:ring-destructive"
                      )}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // Clear errors when user types
                        if (schemaErrors.request_body_schema) {
                          const newErrors = { ...schemaErrors };
                          delete newErrors.request_body_schema;
                          setSchemaErrors(newErrors);
                        }
                      }}
                      onBlur={() => {
                        // Validate JSON on blur
                        const jsonString = field.value;
                        if (!jsonString) return;
                        
                        try {
                          JSON.parse(jsonString);
                          // Clear any existing error on success
                          if (schemaErrors.request_body_schema) {
                            const newErrors = { ...schemaErrors };
                            delete newErrors.request_body_schema;
                            setSchemaErrors(newErrors);
                          }
                        } catch (error) {
                          // Set error state for invalid JSON
                          setSchemaErrors(prev => ({
                            ...prev,
                            request_body_schema: error instanceof Error ? error.message : "Invalid JSON syntax."
                          }));
                        }
                      }}
                    />
                    {schemaErrors.request_body_schema && (
                      <div className="text-xs text-destructive mt-1">
                        {schemaErrors.request_body_schema}
                      </div>
                    )}
                  </div>
                </FormControl>
                <div className="flex justify-end mt-1 space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleGenerateExample("request_body_schema")}
                  >
                    Generate Example
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleValidateJson("request_body_schema")}
                  >
                    Validate JSON
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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
        {/* Example JSON Dialog */}
        <Dialog open={exampleDialogOpen} onOpenChange={setExampleDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{exampleTitle}</DialogTitle>
              <DialogDescription>
                This is an example of how the data might look based on your schema.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm py-4">
              <div>
                <pre className="text-xs bg-muted p-4 rounded overflow-x-auto whitespace-pre-wrap">
                  {exampleJson}
                </pre>
              </div>
              <p className="text-xs text-muted-foreground">
                Note: Dynamic values using $provider will be different each time they are generated at runtime.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </form>
    </Form>
  )
} 