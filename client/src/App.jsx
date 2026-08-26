import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './app/router.jsx';
import { useSessionInit } from './features/auth/useSessionInit.js';

export default function App() {
  useSessionInit();
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
