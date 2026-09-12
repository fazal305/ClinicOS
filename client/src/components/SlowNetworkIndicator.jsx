import { useNetworkStatusStore } from '../store/networkStatusStore.js';
import { Spinner } from './Spinner.jsx';

// Shown only once an in-flight request has been pending longer than the
// "slow" threshold (services/apiClient.js) — distinct from each page's own
// loading spinner, which appears immediately for any in-flight request.
export function SlowNetworkIndicator() {
  const slowRequestCount = useNetworkStatusStore((state) => state.slowRequestCount);

  if (slowRequestCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-md border border-muted bg-surface px-3 py-1.5 shadow-lg">
      <Spinner label="Still working..." />
    </div>
  );
}
