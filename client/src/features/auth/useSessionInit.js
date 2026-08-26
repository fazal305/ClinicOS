import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { refreshRequest } from './authApi.js';

// On first load there is no access token in memory (page refresh clears it),
// but the httpOnly refresh cookie may still be valid. Try to silently
// restore the session once before rendering protected routes.
export function useSessionInit() {
  const status = useAuthStore((state) => state.status);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      try {
        const { accessToken, user } = await refreshRequest();
        if (!cancelled) setSession(accessToken, user);
      } catch {
        if (!cancelled) clearSession();
      }
    }
    restore();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return status;
}
