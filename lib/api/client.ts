import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 401 Interceptor - redirect to login on unauthorized
 * Auth0 token injection is handled by Auth0Interceptor in providers.tsx
 */
let redirecting = false; // Flag to prevent multiple redirects

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('[API] 401 Unauthorized - redirecting to login');
      if (typeof window !== 'undefined' && !redirecting) {
        redirecting = true;
        // Use a small delay to prevent redirect loop
        setTimeout(() => {
          window.location.href = '/login';
          redirecting = false;
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

