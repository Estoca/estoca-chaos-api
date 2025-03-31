"use client"

import { EndpointForm } from "@/components/features/endpoints/endpoint-form"
import { useEndpoints } from "@/hooks/use-endpoints"
import { type UUID } from "@/types/endpoint"
import { safeJsonStringify } from "@/lib/utils"

interface EditEndpointPageProps {
  params: {
    groupId: UUID
    endpointId: UUID
  }
}

// Helper function to create a clean, serializable copy of an object
function createSerializableCopy<T>(obj: T): T {
  if (!obj) return obj;
  
  // For arrays, map over all items recursively
  if (Array.isArray(obj)) {
    return obj.map(item => createSerializableCopy(item)) as unknown as T;
  }
  
  // For objects (but not null), create a clean copy
  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof obj[key] === 'function') {
          // Skip functions
          continue;
        } else if (typeof obj[key] === 'undefined') {
          // Replace undefined with null for JSON compatibility
          result[key] = null;
        } else if (obj[key] === null) {
          // Keep null values as-is
          result[key] = null;
        } else if (typeof obj[key] === 'object') {
          // Recursively handle nested objects/arrays
          result[key] = createSerializableCopy(obj[key]);
        } else {
          // Primitive values can be copied directly
          result[key] = obj[key];
        }
      }
    }
    return result as T;
  }
  
  // For primitive values, return directly
  return obj;
}

export default function EditEndpointPage({ params }: EditEndpointPageProps) {
  const { endpoints } = useEndpoints(params.groupId)
  const endpoint = endpoints.find((e) => e.id === params.endpointId)

  if (!endpoint) {
    return null
  }

  // Create a completely clean, serializable copy of the endpoint
  const sanitizedEndpoint = createSerializableCopy(endpoint);

  // Further ensure default_response is initialized as an empty object
  if (sanitizedEndpoint.headers) {
    sanitizedEndpoint.headers = sanitizedEndpoint.headers.map(header => ({
      ...header,
      default_response: header.default_response || {},
    }));
  }

  if (sanitizedEndpoint.url_parameters) {
    sanitizedEndpoint.url_parameters = sanitizedEndpoint.url_parameters.map(param => ({
      ...param,
      default_response: param.default_response || {},
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Endpoint</h3>
        <p className="text-sm text-muted-foreground">
          Update the endpoint configuration.
        </p>
      </div>
      <div className="border-t">
        <EndpointForm
          groupId={params.groupId}
          endpointId={params.endpointId}
          initialData={{
            name: sanitizedEndpoint.name,
            description: sanitizedEndpoint.description,
            path: sanitizedEndpoint.path,
            max_wait_time: sanitizedEndpoint.max_wait_time,
            chaos_mode: sanitizedEndpoint.chaos_mode,
            response_schema: safeJsonStringify(sanitizedEndpoint.response_schema),
            response_status_code: sanitizedEndpoint.response_status_code,
            response_body: sanitizedEndpoint.response_body,
            method: sanitizedEndpoint.method,
            headers: sanitizedEndpoint.headers || [],
            url_parameters: sanitizedEndpoint.url_parameters || [],
          }}
        />
      </div>
    </div>
  )
} 