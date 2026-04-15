"use client";

import { useAuth0 } from "@auth0/auth0-react";

/**
 * Auth0 authentication hook
 * Provides access to Auth0 authentication state and methods
 */
export function useAuth() {
  const { isAuthenticated, isLoading, user, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0();

  return {
    isAuthenticated,
    isLoading,
    user,
    login: loginWithRedirect,
    logout: () => logout({ logoutParams: { returnTo: window.location.origin } }),
    getAccessToken: async () => {
      return await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
        },
      });
    },
  };
}
