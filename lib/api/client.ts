import axios from 'axios';
import { logger } from '@/lib/utils/logger';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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

    logger.apiError(method, url, status || 0, errorMessage);

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
      // Conflict - e.g., alias already taken
      logger.warn('API', 'Conflict (409)', { message: errorMessage });
    } else if (status === 404) {
      // Not found - e.g., beneficiary not found
      logger.warn('API', 'Not found (404)', { message: errorMessage });
    }

    return Promise.reject(error);
  }
);

