'use client'

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios'

/**
 * Single axios instance for the app.
 * Response interceptor unwraps to raw data, so helpers must NOT read `.data` again.
 */
const apiRequest: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || '/api',
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  timeout: 15000,
})

apiRequest.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  // Auth example:
  // const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  // if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

// Keep unwrap here: all callers receive raw data (T), not AxiosResponse<T>.
apiRequest.interceptors.response.use(
  (res) => (res.data ?? res),
  (err) => Promise.reject(err),
)

type Cfg = AxiosRequestConfig

// Helpers: DO NOT re-read `.data` after the interceptor.
export async function get<T>(url: string, config?: Cfg): Promise<T> {
  const data = await apiRequest.get<T>(url, config)
  return data as unknown as T
}

export async function post<T>(url: string, body?: unknown, config?: Cfg): Promise<T> {
  const data = await apiRequest.post<T>(url, body, config)
  return data as unknown as T
}

export async function put<T>(url: string, body?: unknown, config?: Cfg): Promise<T> {
  const data = await apiRequest.put<T>(url, body, config)
  return data as unknown as T
}

export async function patch<T>(url: string, body?: unknown, config?: Cfg): Promise<T> {
  const data = await apiRequest.patch<T>(url, body, config)
  return data as unknown as T
}

export async function del<T>(url: string, config?: Cfg): Promise<T> {
  const data = await apiRequest.delete<T>(url, config)
  return data as unknown as T
}

export default apiRequest
