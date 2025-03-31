"use client"

import { useState } from "react"
import { type Endpoint } from "@/types/endpoint"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CopyIcon, TerminalIcon, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useGroup } from "@/hooks/use-group"

interface CurlCommandModalProps {
  endpoint: Endpoint
  apiBaseUrl: string
  groupId: string
}

export function CurlCommandModal({ endpoint, apiBaseUrl, groupId }: CurlCommandModalProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { data: group } = useGroup(groupId)

  // Generate the cURL command based on the endpoint configuration
  const generateCurlCommand = () => {
    const url = `${apiBaseUrl}/${group?.name || ""}/${endpoint.path}`;
    
    // Start with the base command
    let curlCommand = `curl -X ${endpoint.method}`;
    
    // Add headers
    if (endpoint.headers && endpoint.headers.length > 0) {
      endpoint.headers.forEach(header => {
        curlCommand += ` \\\n  -H "${header.name}: ${header.value}"`;
      });
    }
    
    // Add Content-Type header for POST/PUT/PATCH methods
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      if (!endpoint.headers?.some(h => h.name.toLowerCase() === 'content-type')) {
        curlCommand += ` \\\n  -H "Content-Type: application/json"`;
      }
    }
    
    // Add request body for POST/PUT/PATCH methods
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      // If we have a request body schema, generate an example based on it
      if (endpoint.request_body_schema && Object.keys(endpoint.request_body_schema).length > 0) {
        // For simplicity, just create a minimal valid object matching the schema
        const exampleData = generateMinimalExample(endpoint.request_body_schema);
        curlCommand += ` \\\n  -d '${JSON.stringify(exampleData, null, 2)}'`;
      } else {
        // Otherwise provide an empty object as placeholder
        curlCommand += ` \\\n  -d '{}'`;
      }
    }
    
    // Add URL parameters
    if (endpoint.url_parameters && endpoint.url_parameters.length > 0) {
      const queryParams = endpoint.url_parameters
        .map(param => `${encodeURIComponent(param.name)}=${encodeURIComponent(param.value)}`)
        .join('&');
      
      curlCommand += ` \\\n  "${url}?${queryParams}"`;
    } else {
      curlCommand += ` \\\n  "${url}"`;
    }
    
    return curlCommand;
  };
  
  const generateMinimalExample = (schema: any): any => {
    if (!schema || typeof schema !== 'object') return {};
    
    // If schema has a type property
    if (schema.type) {
      switch (schema.type) {
        case 'object':
          if (schema.properties) {
            const example: Record<string, any> = {};
            
            // For each required property, generate an example
            if (schema.required && Array.isArray(schema.required)) {
              schema.required.forEach((propName: string) => {
                if (schema.properties[propName]) {
                  example[propName] = generateMinimalExample(schema.properties[propName]);
                }
              });
            }
            
            // If no required properties, add the first property as an example
            if (Object.keys(example).length === 0) {
              const firstPropName = Object.keys(schema.properties)[0];
              if (firstPropName) {
                example[firstPropName] = generateMinimalExample(schema.properties[firstPropName]);
              }
            }
            
            return example;
          }
          return {};
          
        case 'array':
          if (schema.items) {
            return [generateMinimalExample(schema.items)];
          }
          return [];
          
        case 'string':
          return schema.example || "string";
          
        case 'number':
        case 'integer':
          return schema.example || 0;
          
        case 'boolean':
          return schema.example || false;
          
        default:
          return null;
      }
    }
    
    // Default case if schema doesn't specify type
    return {};
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const curlCommand = generateCurlCommand();
    
    try {
      await navigator.clipboard.writeText(curlCommand);
      toast({
        title: "Copied to clipboard",
        description: "cURL command copied to clipboard successfully",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Stop click propagation for the button
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0 z-10"
        onClick={handleButtonClick}
      >
        <TerminalIcon className="h-4 w-4" />
        <span className="sr-only">Show cURL command</span>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>cURL Command for {endpoint.name}</DialogTitle>
            <DialogDescription>
              Use this command to call the endpoint from your terminal
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative">
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono">
              {generateCurlCommand()}
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleCopy}
            >
              <CopyIcon className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            Note: This is a sample cURL command. You may need to adjust parameters and headers for your specific use case.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
} 