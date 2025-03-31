"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { type Header, type UrlParameter } from "@/types/endpoint"
import { safeJsonParse, safeJsonStringify } from "@/lib/utils"

interface ParameterListProps {
  type: "header" | "parameter"
  items: (Header | UrlParameter)[]
  onChange: (items: (Header | UrlParameter)[]) => void
}

export function ParameterList({ type, items, onChange }: ParameterListProps) {
  const [newItem, setNewItem] = useState({
    name: "",
    value: "",
    required: false,
    default_response: {},
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
      default_response: newItem.default_response || {},
      default_status_code: newItem.default_status_code,
    }

    onChange([...items, item])
    setNewItem({
      name: "",
      value: "",
      required: false,
      default_response: {},
      default_status_code: 400,
    })
  }

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, updates: Partial<Header | UrlParameter>) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    )
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
                  <Textarea
                    placeholder="Default Response (JSON)"
                    value={safeJsonStringify(item.default_response)}
                    onChange={(e) => {
                      try {
                        const parsed = safeJsonParse(e.target.value)
                        updateItem(item.id, { default_response: parsed })
                      } catch (error) {
                        // Invalid JSON, ignore
                        console.error("Invalid JSON input:", error)
                      }
                    }}
                  />
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