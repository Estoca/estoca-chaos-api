import axios from "axios"
import { getSession } from "next-auth/react"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
})

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const session = await getSession()
    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`
    }
    console.log("API Request:", {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    })
    return config
  },
  (error) => {
    console.error("API Request Error:", error)
    return Promise.reject(error)
  }
)

// Helper function to redirect to login
const redirectToLogin = () => {
  // Only redirect if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Store the current URL to redirect back after login
    const currentPath = window.location.pathname + window.location.search
    if (currentPath !== '/auth/signin') {
      // Store the current path for potential redirect after login
      sessionStorage.setItem('redirectAfterLogin', currentPath)
      // Redirect to login page
      window.location.href = '/auth/signin'
    }
  }
}

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    })
    return response
  },
  (error) => {
    console.error("API Response Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })

    // Check for 403 Forbidden response
    if (error.response?.status === 403) {
      redirectToLogin()
    }

    return Promise.reject(error)
  }
)

export default api 