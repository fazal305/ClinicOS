import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './app/router.jsx';
import { useSessionInit } from './features/auth/useSessionInit.js';
import { useOnlineStatus } from './hooks/useOnlineStatus.js';
import { Alert } from './components/Alert.jsx';
import { SlowNetworkIndicator } from './components/SlowNetworkIndicator.jsx';

export default function App() {
  useSessionInit();
  const isOnline = useOnlineStatus();

  return (
    <BrowserRouter>
      {!isOnline && (
        <div className="sticky top-0 z-50 px-3 pt-3">
          <Alert tone="danger">You&apos;re offline — changes won&apos;t save until you reconnect.</Alert>
        </div>
      )}
      <AppRouter />
      <SlowNetworkIndicator />
    </BrowserRouter>
  );
}
