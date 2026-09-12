import { create } from 'zustand';

// Tracks how many in-flight API requests have been pending longer than the
// "slow" threshold (see services/apiClient.js). Used to surface a lightweight
// "still working..." indicator distinct from each page's own loading spinner.
export const useNetworkStatusStore = create((set) => ({
  slowRequestCount: 0,

  markSlow: () => set((state) => ({ slowRequestCount: state.slowRequestCount + 1 })),
  clearSlow: () =>
    set((state) => ({ slowRequestCount: Math.max(0, state.slowRequestCount - 1) })),
}));
