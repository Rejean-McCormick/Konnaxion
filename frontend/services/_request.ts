'use client'

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios'

const apiRequest: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || '/api',
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  timeout: 15000,
})

apiRequest.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  // Exemple d’auth:
  // const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  // if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

apiRequest.interceptors.response.use(
  (res) => (res.data ?? res),
  (err) => Promise.reject(err),
)

type Cfg = AxiosRequestConfig

export async function get<T>(url: string, config?: Cfg): Promise<T> {
    const res = await apiRequest.get<T>(url, config);
    return (res as any).data as T;
}

export async function post<T>(url: string, body?: any, config?: Cfg): Promise<T> {
    const res = await apiRequest.post<T>(url, body, config);
    return (res as any).data as T;
}

export async function put<T>(url: string, body?: any, config?: Cfg): Promise<T> {
    const res = await apiRequest.put<T>(url, body, config);
    return (res as any).data as T;
}

export async function patch<T>(url: string, body?: any, config?: Cfg): Promise<T> {
    const res = await apiRequest.patch<T>(url, body, config);
    return (res as any).data as T;
}

export async function del<T>(url: string, config?: Cfg): Promise<T> {
    const res = await apiRequest.delete<T>(url, config);
    return (res as any).data as T;
}

export default apiRequest
