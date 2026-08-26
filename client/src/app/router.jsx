import PropTypes from 'prop-types';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../features/auth/LoginPage.jsx';
import { ProtectedRoute } from '../features/auth/ProtectedRoute.jsx';
import { AppLayout } from '../layouts/AppLayout.jsx';
import { DashboardPage } from '../features/dashboard/DashboardPage.jsx';
import { useAuthStore } from '../store/authStore.js';
import { homePathForRole } from '../features/auth/roleHome.js';
import UnauthorizedPage from '../pages/UnauthorizedPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import PatientsListPage from '../features/patients/PatientsListPage.jsx';
import PatientRegisterPage from '../features/patients/PatientRegisterPage.jsx';
import PatientProfilePage from '../features/patients/PatientProfilePage.jsx';
import AppointmentsListPage from '../features/appointments/AppointmentsListPage.jsx';
import AppointmentCreatePage from '../features/appointments/AppointmentCreatePage.jsx';
import AppointmentDetailPage from '../features/appointments/AppointmentDetailPage.jsx';
import TodaysQueuePage from '../features/appointments/TodaysQueuePage.jsx';
import VisitDocumentationPage from '../features/appointments/VisitDocumentationPage.jsx';
import AdminDashboardPage from '../features/reports/AdminDashboardPage.jsx';
import DoctorsManagementPage from '../features/doctors/DoctorsManagementPage.jsx';
import DepartmentsManagementPage from '../features/departments/DepartmentsManagementPage.jsx';
import ReceptionistsManagementPage from '../features/receptionists/ReceptionistsManagementPage.jsx';
import PaymentsPage from '../features/payments/PaymentsPage.jsx';
import AuditLogPage from '../features/auditLogs/AuditLogPage.jsx';

function RoleDashboard({ role, title }) {
  return (
    <ProtectedRoute roles={[role]}>
      <AppLayout>
        <DashboardPage title={title} />
      </AppLayout>
    </ProtectedRoute>
  );
}

RoleDashboard.propTypes = {
  role: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

function ProtectedPage({ roles, children }) {
  return (
    <ProtectedRoute roles={roles}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

ProtectedPage.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
};

function RootRedirect() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  if (status === 'idle' || status === 'loading') return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homePathForRole(user.role)} replace />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/" element={<RootRedirect />} />
      <Route
        path="/admin"
        element={
          <ProtectedPage roles={['ADMIN']}>
            <AdminDashboardPage />
          </ProtectedPage>
        }
      />
      <Route path="/doctor" element={<RoleDashboard role="DOCTOR" title="Doctor Dashboard" />} />
      <Route path="/reception" element={<RoleDashboard role="RECEPTIONIST" title="Receptionist Dashboard" />} />
      <Route path="/patient" element={<RoleDashboard role="PATIENT" title="Patient Dashboard" />} />

      <Route
        path="/admin/doctors"
        element={
          <ProtectedPage roles={['ADMIN']}>
            <DoctorsManagementPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedPage roles={['ADMIN']}>
            <DepartmentsManagementPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/admin/receptionists"
        element={
          <ProtectedPage roles={['ADMIN']}>
            <ReceptionistsManagementPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/admin/audit-log"
        element={
          <ProtectedPage roles={['ADMIN']}>
            <AuditLogPage />
          </ProtectedPage>
        }
      />

      <Route
        path="/payments"
        element={
          <ProtectedPage roles={['ADMIN', 'RECEPTIONIST', 'PATIENT']}>
            <PaymentsPage />
          </ProtectedPage>
        }
      />

      <Route
        path="/patients"
        element={
          <ProtectedPage roles={['ADMIN', 'DOCTOR', 'RECEPTIONIST']}>
            <PatientsListPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/patients/new"
        element={
          <ProtectedPage roles={['ADMIN', 'RECEPTIONIST']}>
            <PatientRegisterPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/patients/me"
        element={
          <ProtectedPage roles={['PATIENT']}>
            <PatientProfilePage ownMode />
          </ProtectedPage>
        }
      />
      <Route
        path="/patients/:id"
        element={
          <ProtectedPage roles={['ADMIN', 'DOCTOR', 'RECEPTIONIST']}>
            <PatientProfilePage />
          </ProtectedPage>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedPage roles={['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT']}>
            <AppointmentsListPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/appointments/new"
        element={
          <ProtectedPage roles={['ADMIN', 'RECEPTIONIST']}>
            <AppointmentCreatePage />
          </ProtectedPage>
        }
      />
      <Route
        path="/appointments/:id"
        element={
          <ProtectedPage roles={['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT']}>
            <AppointmentDetailPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/appointments/:id/visit"
        element={
          <ProtectedPage roles={['DOCTOR']}>
            <VisitDocumentationPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/queue"
        element={
          <ProtectedPage roles={['ADMIN', 'DOCTOR', 'RECEPTIONIST']}>
            <TodaysQueuePage />
          </ProtectedPage>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
