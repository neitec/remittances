'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersEndpoint } from '@/lib/api/endpoints/users';
import { queryKeys } from '@/lib/queryKeys';
import { User } from '@/lib/types';

export function useUpdateAlias() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, string>({
    mutationFn: async (alias) => usersEndpoint.updateAlias(alias),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}
