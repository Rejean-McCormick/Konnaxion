ni shared\api.ts -Force -Value @'
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  withCredentials: true,  // JWT cookie
  timeout: 10_000,
});
'@
