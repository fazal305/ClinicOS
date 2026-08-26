import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { Spinner } from '../../components/Spinner.jsx';

// Route guarding is UX, not security — the backend re-checks role on every
// request regardless of what this component allows through.
export function ProtectedRoute({ roles, children }) {
  const location = useLocation();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  if (status === 'idle' || status === 'loading') {
    return <Spinner label="Checking your session..." />;
  }

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node.isRequired,
};
