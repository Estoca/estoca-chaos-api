export interface Group {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  created_by_id: string
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