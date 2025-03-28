import axios from "axios"
import { getSession } from "next-auth/react"

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1`,
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
    return Promise.reject(error)
  }
)

export default api 