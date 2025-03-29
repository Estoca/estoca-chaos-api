import { type UUID } from "./endpoint"

export interface Group {
  id: UUID
  name: string
  description: string | null
  created_at: string
  updated_at: string
  created_by_id: UUID
  deleted_at: string | null
  created_at_epoch: number
}

export interface CreateGroupInput {
  name: string
  description: string
}

export interface UpdateGroupInput {
  name?: string
  description?: string
} 