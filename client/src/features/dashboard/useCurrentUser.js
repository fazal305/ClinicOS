import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '../auth/authApi.js';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchCurrentUser,
    staleTime: 60_000,
  });
}
