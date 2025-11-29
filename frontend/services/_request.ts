// FILE: frontend/services/_request.ts
'use client'

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios'

/**
 * One axios instance.
 * Do NOT unwrap in interceptors; wrappers below return `data` as T.
 */
const client: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? '/api',
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  timeout: 15000,
})

client.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  // Example:
  // const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  // if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

client.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err),
)

type Cfg<D = any> = AxiosRequestConfig<D>

/** Typed helpers: always return raw data `T` */
export async function get<T, D = any>(url: string, config?: Cfg<D>): Promise<T> {
  const res = await client.get<T>(url, config)
  return res.data as T
}

export async function post<T, D = any>(
  url: string,
  body?: D,
  config?: Cfg<D>,
): Promise<T> {
  const res = await client.post<T>(url, body, config)
  return res.data as T
}

export async function put<T, D = any>(
  url: string,
  body?: D,
  config?: Cfg<D>,
): Promise<T> {
  const res = await client.put<T>(url, body, config)
  return res.data as T
}

export async function patch<T, D = any>(
  url: string,
  body?: D,
  config?: Cfg<D>,
): Promise<T> {
  const res = await client.patch<T>(url, body, config)
  return res.data as T
}

export async function del<T, D = any>(url: string, config?: Cfg<D>): Promise<T> {
  const res = await client.delete<T>(url, config)
  return res.data as T
}

/**
 * Default export: axios instance augmented with data-returning methods.
 * Allows `api.post<T>(...)` to yield `T` (not AxiosResponse<T>).
 */
type DataMethods = {
  get<T, D = any>(url: string, config?: Cfg<D>): Promise<T>
  post<T, D = any>(url: string, body?: D, config?: Cfg<D>): Promise<T>
  put<T, D = any>(url: string, body?: D, config?: Cfg<D>): Promise<T>
  patch<T, D = any>(url: string, body?: D, config?: Cfg<D>): Promise<T>
  delete<T, D = any>(url: string, config?: Cfg<D>): Promise<T>
  del<T, D = any>(url: string, config?: Cfg<D>): Promise<T>
}

type API = Omit<AxiosInstance, 'get' | 'post' | 'put' | 'patch' | 'delete'> & DataMethods

const api = Object.assign(client, {
  async get<T, D = any>(url: string, config?: Cfg<D>) {
    const res = await client.get<T>(url, config)
    return res.data as T
  },
  async post<T, D = any>(url: string, body?: D, config?: Cfg<D>) {
    const res = await client.post<T>(url, body, config)
    return res.data as T
  },
  async put<T, D = any>(url: string, body?: D, config?: Cfg<D>) {
    const res = await client.put<T>(url, body, config)
    return res.data as T
  },
  async patch<T, D = any>(url: string, body?: D, config?: Cfg<D>) {
    const res = await client.patch<T>(url, body, config)
    return res.data as T
  },
  async delete<T, D = any>(url: string, config?: Cfg<D>) {
    const res = await client.delete<T>(url, config)
    return res.data as T
  },
  async del<T, D = any>(url: string, config?: Cfg<D>) {
    const res = await client.delete<T>(url, config)
    return res.data as T
  },
}) as API

export default api
