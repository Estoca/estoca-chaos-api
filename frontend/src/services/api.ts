import { CreateGroupInput, Group, UpdateGroupInput } from "@/types/group"
import { getSession } from "next-auth/react"
import { type Endpoint, type UUID, type EndpointCreate, type EndpointUpdate } from "@/types/endpoint"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8033/api/v1"

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

// --- Endpoint Functions --- //

interface DeleteEndpointParams {
  groupId: string
  endpointId: string
}

export async function deleteEndpoint({ groupId, endpointId }: DeleteEndpointParams): Promise<void> {
  const response = await fetch(`${API_URL}/groups/${groupId}/endpoints/${endpointId}`, {
    method: "DELETE",
    headers: await getHeaders(),
  })

  if (!response.ok) {
    // Attempt to get error details from response body
    let errorDetail = `Failed to delete endpoint. Status: ${response.status}`;
    try {
      const errorBody = await response.json();
      errorDetail = errorBody.detail || errorDetail;
    } catch (e) {
      // Ignore if response body isn't JSON or empty
    }
    throw new Error(errorDetail);
  }
  // No explicit return needed for void
}

// --- Types needed for Endpoint API functions ---

interface EndpointApiParams {
  groupId: UUID
  endpointId: UUID
}

interface UpdateEndpointPayload {
  groupId: UUID
  endpointId: UUID
  data: EndpointUpdate // Or a more specific update type if needed
}

// Add getEndpoint function
export async function getEndpoint({ groupId, endpointId }: EndpointApiParams): Promise<Endpoint> {
  const response = await fetch(`${API_URL}/groups/${groupId}/endpoints/${endpointId}`, {
    headers: await getHeaders(),
  });

  if (!response.ok) {
    let errorDetail = `Failed to fetch endpoint. Status: ${response.status}`;
    try {
      const errorBody = await response.json();
      // Handle 404 specifically if needed for notFound()
      if (response.status === 404) {
        throw new Error(errorBody.detail || 'Endpoint not found');
      } 
      errorDetail = errorBody.detail || errorDetail;
    } catch (e) {
       if (e instanceof Error) errorDetail = e.message;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// TODO: Add function for getEndpoints
// TODO: Add function for createEndpoint

export async function updateEndpoint({ groupId, endpointId, data }: UpdateEndpointPayload): Promise<Endpoint> {
  const response = await fetch(`${API_URL}/groups/${groupId}/endpoints/${endpointId}`, {
    method: "PUT",
    headers: await getHeaders(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    let errorDetail = `Failed to update endpoint. Status: ${response.status}`;
    try {
      const errorBody = await response.json();
      errorDetail = errorBody.detail || errorDetail;
    } catch (e) {
      // Ignore if response body isn't JSON or empty
    }
    throw new Error(errorDetail);
  }

  return response.json();
} 