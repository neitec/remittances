import axios from 'axios';
import { logger } from '@/lib/utils/logger';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - log API calls
apiClient.interceptors.request.use(
  (config) => {
    logger.apiCall(config.method?.toUpperCase() || 'REQUEST', config.url || '', config.data);
    return config;
  },
  (error) => {
    logger.error('API', 'Request failed', error);
    return Promise.reject(error);
  }
);

/**
 * 401 Interceptor - redirect to login on unauthorized
 * Auth0 token injection is handled by Auth0Interceptor in providers.tsx
 */
let redirecting = false; // Flag to prevent multiple redirects

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;
    const method = error.config?.method?.toUpperCase() || 'REQUEST';
    const url = error.config?.url || 'unknown';

    // 404s on these endpoints are normal UX flow (search-as-you-type, optional rates).
    const isExpected404 =
      status === 404 &&
      (url.includes('/remittance/users') || url.includes('/remittance/fx'));

    if (!isExpected404) {
      logger.apiError(method, url, status || 0, errorMessage);
    }

    if (status === 401) {
      logger.warn('API', '401 Unauthorized - redirecting to login');
      if (typeof window !== 'undefined' && !redirecting) {
        redirecting = true;
        setTimeout(() => {
          window.location.href = '/login';
          redirecting = false;
        }, 100);
      }
    } else if (status === 409) {
      logger.warn('API', 'Conflict (409)', { message: errorMessage });
    } else if (status === 404 && !isExpected404) {
      logger.warn('API', 'Not found (404)', { message: errorMessage });
    }

    return Promise.reject(error);
  }
);

