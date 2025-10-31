import axios, { AxiosRequestConfig } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const axiosInstance = axios.create({ baseURL, withCredentials: true });

export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => axiosInstance.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => axiosInstance.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => axiosInstance.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => axiosInstance.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => axiosInstance.delete<T>(url, config),
};

export default axiosInstance;
