"use client";

import { useQuery } from "@tanstack/react-query";
import { userAPI } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";

export function useMe() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => userAPI.getMe(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
