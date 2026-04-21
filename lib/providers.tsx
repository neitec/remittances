"use client";

import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/lib/query-client";
import { apiClient } from "@/lib/api";

function getRedirectUri(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI || '';
  }
  return `${window.location.origin}/api/auth/callback`;
}

function Auth0Wrapper({ children }: { children: ReactNode }) {
  const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;

  if (!auth0ClientId) {
    throw new Error('NEXT_PUBLIC_AUTH0_CLIENT_ID is not configured. Auth0 is required.');
  }

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN || ''}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: getRedirectUri(),
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
        scope: 'openid profile email',
      }}
      cacheLocation="localstorage"
    >
      <Auth0Interceptor>{children}</Auth0Interceptor>
    </Auth0Provider>
  );
}

/**
 * Register Auth0 Bearer token interceptor
 * This component registers the axios interceptor to inject Auth0 JWT tokens
 */
function Auth0Interceptor({ children }: { children: ReactNode }) {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    // Register interceptor to inject Bearer token from Auth0
    const interceptorId = apiClient.interceptors.request.use(
      async (config) => {
        // Inject Bearer token if Auth0 is authenticated
        // Note: getAccessTokenSilently() handles loading state internally
        if (isAuthenticated) {
          try {
            const token = await getAccessTokenSilently({
              authorizationParams: {
                audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
              },
            });
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error("[Auth0] ❌ Failed to get token:", error instanceof Error ? error.message : error);
          }
        } else {
          console.debug("[Auth0] ⏳ Not authenticated yet, skipping token injection for:", config.url);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      apiClient.interceptors.request.eject(interceptorId);
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  return children;
}

export default function Providers({ children }: { children: ReactNode }) {
  // Suppress MetaMask and web3 console errors (not used in remittances app)
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      const errorStr = args.toString().toLowerCase();
      // Suppress MetaMask and web3 related errors
      if (
        errorStr.includes('metamask') ||
        errorStr.includes('ethereum') ||
        errorStr.includes('web3') ||
        errorStr.includes('inpage.js') ||
        errorStr.includes('failed to connect')
      ) {
        return;
      }
      originalError(...args);
    };

    console.warn = (...args: any[]) => {
      const warnStr = args.toString().toLowerCase();
      if (
        warnStr.includes('metamask') ||
        warnStr.includes('ethereum') ||
        warnStr.includes('web3')
      ) {
        return;
      }
      originalWarn(...args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return (
    <Auth0Wrapper>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </Auth0Wrapper>
  );
}
