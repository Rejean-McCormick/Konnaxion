'use client'

// fichier: Front1/services/_request.ts
import axios from 'axios';

const apiRequest = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || '/api',
  withCredentials: true,
  xsrfCookieName: 'csrftoken',       // Utiliser le cookie CSRF de Django
  xsrfHeaderName: 'X-CSRFToken',    // Envoyer le header CSRF approprié
});

/* ---------- Optional interceptors ---------- */
// Add auth token, global error toast, etc.
apiRequest.interceptors.request.use(cfg => {
  // const token = localStorage.getItem('token');
  // if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

apiRequest.interceptors.response.use(
  res => res.data,
  err => {
    // You can hook a global notification here if you like
    return Promise.reject(err);
  },
);

export default apiRequest;
