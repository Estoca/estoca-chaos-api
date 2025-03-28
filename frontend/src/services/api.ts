import { CreateGroupInput, Group, UpdateGroupInput } from "@/types/group"
import { getSession } from "next-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

async function getHeaders() {
  const session = await getSession()
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${session?.user?.accessToken}`,
  }
}

export async function getGroups(): Promise<Group[]> {
  const response = await fetch(`${API_URL}/groups`, {
    headers: await getHeaders(),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch groups")
  }

  return response.json()
}

export async function getGroup(id: string): Promise<Group> {
  const response = await fetch(`${API_URL}/groups/${id}`, {
    headers: await getHeaders(),
  })

  if (!response.ok) {
    throw new Error("Failed to fetch group")
  }

  return response.json()
}

export async function createGroup(data: CreateGroupInput): Promise<Group> {
  const response = await fetch(`${API_URL}/groups`, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Failed to create group")
  }

  return response.json()
}

export async function updateGroup(id: string, data: UpdateGroupInput): Promise<Group> {
  const response = await fetch(`${API_URL}/groups/${id}`, {
    method: "PUT",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Failed to update group")
  }

  return response.json()
}

export async function deleteGroup(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/groups/${id}`, {
    method: "DELETE",
    headers: await getHeaders(),
  })

  if (!response.ok) {
    throw new Error("Failed to delete group")
  }
} 