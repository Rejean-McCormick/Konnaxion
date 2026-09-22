// FILE: frontend/shared/api.ts
// shared/api.ts
'use client';

import axios from 'axios';

import {
  assertCurrentWorldResponse,
  scopeApiPathForBrowser,
  scopeBrowserApiUrl,
} from '@/lib/worlds';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (config.url) {
    config.url = /^https?:\/\//i.test(config.url)
      ? scopeBrowserApiUrl(config.url)
      : scopeApiPathForBrowser(config.url);
  }
  return config;
});

api.interceptors.response.use((response) => {
  assertCurrentWorldResponse(
    response.headers?.['x-konnaxion-world'],
    response.headers?.['x-konnaxion-world-release-id'],
  );
  return response;
});
