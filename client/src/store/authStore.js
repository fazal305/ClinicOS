import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  status: 'idle', // idle | loading | authenticated | unauthenticated

  setSession: (accessToken, user) => set({ accessToken, user, status: 'authenticated' }),
  clearSession: () => set({ accessToken: null, user: null, status: 'unauthenticated' }),
  setStatus: (status) => set({ status }),
}));
