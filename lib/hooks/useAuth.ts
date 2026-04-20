"use client";

import { useAuth0 } from "@auth0/auth0-react";

const isDesignMode = process.env.NEXT_PUBLIC_DESIGN_MODE === "true";

/**
 * Auth0 authentication hook
 * In design mode, returns a mocked authenticated state so no Auth0 provider is needed.
 */
export function useAuth() {
  // In design mode Auth0Provider is not mounted — return a mock auth state
  if (isDesignMode) {
    return {
      isAuthenticated: true,
      isLoading: false,
      user: { name: "Eduard", email: "eduard@neitec.com", picture: undefined },
      login: async () => {},
      logout: () => {},
      getAccessToken: async () => "design-mode-token",
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
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
