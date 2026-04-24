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
  withXSRFToken: true,
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

/**
 * Keep a stable reference to the original axios request method.
 * This avoids recursion when api.get/post/... are overridden below.
 */
const rawRequest = client.request.bind(client)

async function requestData<T, D = any>(
  method: NonNullable<AxiosRequestConfig<D>['method']>,
  url: string,
  bodyOrConfig?: D | Cfg<D>,
  maybeConfig?: Cfg<D>,
): Promise<T> {
  const isBodyMethod =
    method === 'post' || method === 'put' || method === 'patch'

  const config = (isBodyMethod ? maybeConfig : bodyOrConfig) as
    | Cfg<D>
    | undefined
  const data = (isBodyMethod ? bodyOrConfig : undefined) as D | undefined

  const res = await rawRequest<T>({
    url,
    method,
    ...(config ?? {}),
    ...(isBodyMethod ? { data } : {}),
  })

  return res.data as T
}

/** Typed helpers: always return raw data `T` */
export async function get<T, D = any>(
  url: string,
  config?: Cfg<D>,
): Promise<T> {
  return requestData<T, D>('get', url, config)
}

export async function post<T, D = any>(
  url: string,
  body?: D,
  config?: Cfg<D>,
): Promise<T> {
  return requestData<T, D>('post', url, body, config)
}

export async function put<T, D = any>(
  url: string,
  body?: D,
  config?: Cfg<D>,
): Promise<T> {
  return requestData<T, D>('put', url, body, config)
}

export async function patch<T, D = any>(
  url: string,
  body?: D,
  config?: Cfg<D>,
): Promise<T> {
  return requestData<T, D>('patch', url, body, config)
}

export async function del<T, D = any>(
  url: string,
  config?: Cfg<D>,
): Promise<T> {
  return requestData<T, D>('delete', url, config)
}

/**
 * Default export: axios instance augmented with data-returning methods.
 * Important: methods must use rawRequest, not client.get/post/etc.,
 * otherwise overriding them causes infinite recursion.
 */
type DataMethods = {
  get<T, D = any>(url: string, config?: Cfg<D>): Promise<T>
  post<T, D = any>(url: string, body?: D, config?: Cfg<D>): Promise<T>
  put<T, D = any>(url: string, body?: D, config?: Cfg<D>): Promise<T>
  patch<T, D = any>(url: string, body?: D, config?: Cfg<D>): Promise<T>
  delete<T, D = any>(url: string, config?: Cfg<D>): Promise<T>
  del<T, D = any>(url: string, config?: Cfg<D>): Promise<T>
}

type API = Omit<AxiosInstance, 'get' | 'post' | 'put' | 'patch' | 'delete'> &
  DataMethods

const api = client as unknown as API

api.get = get
api.post = post
api.put = put
api.patch = patch
api.delete = del
api.del = del

export default api