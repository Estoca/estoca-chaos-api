"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { type Header, type UrlParameter } from "@/types/endpoint"
import { safeJsonParse, safeJsonStringify } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface ParameterListProps {
  type: "header" | "parameter"
  items: (Header | UrlParameter)[]
  onChange: (items: (Header | UrlParameter)[]) => void
}

export function ParameterList({ type, items, onChange }: ParameterListProps) {
  const { toast } = useToast()
  const [editingJsonIds, setEditingJsonIds] = useState<Record<string, string>>({})
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({})
  const [newItem, setNewItem] = useState({
    name: "",
    value: "",
    required: false,
    default_response: undefined,
    default_status_code: 400,
  })

  const addItem = () => {
    if (!newItem.name || !newItem.value) return

    const item: Header | UrlParameter = {
      id: crypto.randomUUID(),
      endpoint_id: "", // This will be set by the parent
      name: newItem.name,
      value: newItem.value,
      required: newItem.required,
      default_response: newItem.default_response,
      default_status_code: newItem.default_status_code,
    }

    onChange([...items, item])
    setNewItem({
      name: "",
      value: "",
      required: false,
      default_response: undefined,
      default_status_code: 400,
    })
  }

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
    // Remove any editing state for this item
    if (editingJsonIds[id]) {
      const newEditingIds = { ...editingJsonIds }
      delete newEditingIds[id]
      setEditingJsonIds(newEditingIds)
    }
    // Remove any error state
    if (jsonErrors[id]) {
      const newErrors = { ...jsonErrors }
      delete newErrors[id]
      setJsonErrors(newErrors)
    }
  }

  const updateItem = (id: string, updates: Partial<Header | UrlParameter>) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    )
  }
  
  const handleJsonChange = (id: string, value: string) => {
    setEditingJsonIds({
      ...editingJsonIds,
      [id]: value
    })
    
    // Clear error when user edits the field
    if (jsonErrors[id]) {
      const newErrors = { ...jsonErrors }
      delete newErrors[id]
      setJsonErrors(newErrors)
    }
  }
  
  const validateJson = (id: string) => {
    // Get the current value (either from editing state or from item)
    const jsonValue = editingJsonIds[id] !== undefined 
      ? editingJsonIds[id]
      : (() => {
          const defaultResponse = items.find(item => item.id === id)?.default_response;
          if (!defaultResponse) return "";
          // Check if it's an empty object
          if (typeof defaultResponse === 'object' && 
              Object.keys(defaultResponse).length === 0) {
            return "";
          }
          return safeJsonStringify(defaultResponse);
        })();
    
    // Ensure we're tracking this value in the editing state
    if (editingJsonIds[id] === undefined) {
      setEditingJsonIds({
        ...editingJsonIds,
        [id]: jsonValue
      })
    }
    
    try {
      // Just validate, don't modify any state except clearing errors
      JSON.parse(jsonValue)
      
      // Clear any existing error
      if (jsonErrors[id]) {
        const newErrors = { ...jsonErrors }
        delete newErrors[id]
        setJsonErrors(newErrors)
      }
      
      toast({
        title: "Valid JSON",
        description: "The JSON format is valid.",
      })
    } catch (error) {
      // Set error state for the field but don't change the JSON content
      setJsonErrors({
        ...jsonErrors,
        [id]: error instanceof Error ? error.message : "Invalid JSON format"
      })
      
      toast({
        title: "Invalid JSON",
        description: error instanceof Error ? error.message : "Invalid JSON format",
        variant: "destructive",
      })
    }
  }
  
  const handleJsonBlur = (id: string) => {
    const jsonValue = editingJsonIds[id]
    if (jsonValue === undefined) return
    
    try {
      // Only attempt to parse and update if the JSON is valid
      JSON.parse(jsonValue)
      const parsed = JSON.parse(jsonValue)
      updateItem(id, { default_response: parsed })
      
      // Clear any existing error
      if (jsonErrors[id]) {
        const newErrors = { ...jsonErrors }
        delete newErrors[id]
        setJsonErrors(newErrors)
      }
      
      // Only remove from editing state if valid
      // Keep this commented out to maintain the editing state even for valid JSON
      // to prevent inconsistent behavior between valid/invalid entries
      // const newEditingIds = { ...editingJsonIds }
      // delete newEditingIds[id]
      // setEditingJsonIds(newEditingIds)
    } catch (error) {
      // Set error state but NEVER modify the actual text in the field
      setJsonErrors({
        ...jsonErrors,
        [id]: error instanceof Error ? error.message : "Invalid JSON format"
      })
      
      // For invalid JSON, we need to set a temporary object so the field isn't cleared
      // but we'll keep the editing state so the user's text is preserved
      updateItem(id, { default_response: { _invalidJson: true } })
      
      // Don't clear the editing state for invalid JSON so it persists
      toast({
        title: "Invalid JSON",
        description: error instanceof Error ? error.message : "Invalid JSON format",
        variant: "destructive",
      })
    }
  }
  
  // Initialize JSON editing state for an item if not already present
  const getJsonEditValue = (item: Header | UrlParameter): string => {
    // If we have a value in the editing state, use that
    if (editingJsonIds[item.id] !== undefined) {
      return editingJsonIds[item.id];
    }
    
    // Handle null or undefined default_response
    if (item.default_response === null || item.default_response === undefined) {
      return "";
    }
    
    // Handle empty objects - return empty string instead of "{}"
    if (typeof item.default_response === 'object' && 
        Object.keys(item.default_response).length === 0) {
      return "";
    }
    
    return safeJsonStringify(item.default_response);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder={`Enter ${type} name`}
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <Input
          placeholder={`Enter ${type} value`}
          value={newItem.value}
          onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
        />
        <Button type="button" onClick={addItem}>
          Add {type}
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-4 rounded-lg border p-4"
          >
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Name"
                  value={item.name}
                  onChange={(e) =>
                    updateItem(item.id, { name: e.target.value })
                  }
                />
                <Input
                  placeholder="Value"
                  value={item.value}
                  onChange={(e) =>
                    updateItem(item.id, { value: e.target.value })
                  }
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.required}
                    onChange={(e) =>
                      updateItem(item.id, { required: e.target.checked })
                    }
                  />
                  <span className="text-sm">Required</span>
                </div>
              </div>
              {item.required && (
                <div className="space-y-2">
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium">
                      Default Status Code
                      <span className="text-xs text-muted-foreground ml-1">(when {type} is missing or invalid)</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="Default Status Code"
                      value={item.default_status_code}
                      onChange={(e) =>
                        updateItem(item.id, {
                          default_status_code: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium">
                      Default Error Response
                      <span className="text-xs text-muted-foreground ml-1">(JSON returned when {type} is missing or invalid)</span>
                    </label>
                    <div className="relative">
                      <Textarea
                        placeholder="Enter JSON error response for when this required parameter is missing"
                        value={getJsonEditValue(item)}
                        onChange={(e) => handleJsonChange(item.id, e.target.value)}
                        onBlur={() => handleJsonBlur(item.id)}
                        className={cn(
                          "font-mono text-sm resize-y min-h-[100px]",
                          jsonErrors[item.id] && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      {jsonErrors[item.id] && (
                        <div className="text-xs text-destructive mt-1">
                          {jsonErrors[item.id]}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end mt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => validateJson(item.id)}
                      >
                        Validate JSON
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeItem(item.id)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
} 