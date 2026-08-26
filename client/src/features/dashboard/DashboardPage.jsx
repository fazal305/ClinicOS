import PropTypes from 'prop-types';
import { Spinner } from '../../components/Spinner.jsx';
import { Alert } from '../../components/Alert.jsx';
import { useCurrentUser } from './useCurrentUser.js';

const PROFILE_FIELDS = {
  ADMIN: () => [],
  DOCTOR: (p) => [
    ['Name', p ? `Dr. ${p.first_name} ${p.last_name}` : '—'],
    ['Specialization', p?.specialization ?? '—'],
    ['Department', p?.department_name ?? 'Unassigned'],
  ],
  RECEPTIONIST: (p) => [['Name', p ? `${p.first_name} ${p.last_name}` : '—']],
  PATIENT: (p) => [
    ['Name', p ? `${p.first_name} ${p.last_name}` : '—'],
    ['Patient ID', p?.patient_code ?? '—'],
  ],
};

const WELCOME_COPY = {
  ADMIN: 'Monitor clinic operations, manage staff, and review analytics from here.',
  DOCTOR: "Your clinical workflow — today's appointments, patient records, and prescriptions — will appear here.",
  RECEPTIONIST: 'Patient registration, appointment scheduling, and the daily queue will appear here.',
  PATIENT: 'Your appointments, prescriptions, and visit history will appear here.',
};

export function DashboardPage({ title }) {
  const { data: user, isLoading, isError, refetch } = useCurrentUser();

  if (isLoading) {
    return <Spinner label="Loading your dashboard..." />;
  }

  if (isError || !user) {
    return (
      <Alert tone="danger">
        Unable to load your account details.{' '}
        <button type="button" onClick={() => refetch()} className="underline">
          Try again
        </button>
      </Alert>
    );
  }

  const fields = (PROFILE_FIELDS[user.role] || (() => []))(user.profile);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">{title}</h1>
        <p className="mt-1 text-muted">{WELCOME_COPY[user.role]}</p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Account</h2>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted">Email</dt>
            <dd className="text-sm text-text">{user.email}</dd>
          </div>
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="text-sm text-text">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Alert tone="success">
        Phase 1 (foundation: authentication and role-based access) is live. Patient, appointment, and clinical
        workflows are built out in the phases that follow.
      </Alert>
    </div>
  );
}

DashboardPage.propTypes = {
  title: PropTypes.string.isRequired,
};
