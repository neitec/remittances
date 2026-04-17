"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI, User } from "@/lib/api";

export function useUpdateAlias() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, string>({
    mutationFn: async (alias) => userAPI.updateAlias(alias),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
