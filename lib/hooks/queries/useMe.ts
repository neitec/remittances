'use client';

import { useQuery } from '@tanstack/react-query';
import { usersEndpoint } from '@/lib/api/endpoints/users';
import { queryKeys } from '@/lib/queryKeys';
import { User } from '@/lib/types';

export function useMe() {
  return useQuery<User>({
    queryKey: queryKeys.me,
    queryFn: () => usersEndpoint.getMe(),
    staleTime: 10 * 60 * 1000,
  });
}
