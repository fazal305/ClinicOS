import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Select } from '../../components/Select.jsx';
import { TextField } from '../../components/TextField.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { TableSkeleton } from '../../components/TableSkeleton.jsx';
import { Alert } from '../../components/Alert.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { Button } from '../../components/Button.jsx';
import { Badge } from '../../components/Badge.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { extractErrorMessage } from '../../services/apiClient.js';
import { listAppointments, updateAppointmentStatus } from './appointmentsApi.js';
import { listDoctors } from '../doctors/doctorsApi.js';
import { STATUS_LABEL, STATUS_TONE, getAvailableActions } from './appointmentSchema.js';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
];

function formatDateTime(value) {
  return new Date(value).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AppointmentsListPage() {
  const role = useAuthStore((state) => state.user?.role);
  const canSchedule = ['ADMIN', 'RECEPTIONIST'].includes(role);
  const queryClient = useQueryClient();

  const [date, setDate] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState(null);

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => listDoctors(),
    enabled: role === 'ADMIN' || role === 'RECEPTIONIST',
  });

  const filters = { date: date || undefined, doctorId: doctorId || undefined, status: status || undefined, page };
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => listAppointments(filters),
    placeholderData: (previous) => previous,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }) => updateAppointmentStatus(id, next),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => setActionError(extractErrorMessage(error, 'Unable to update this appointment.')),
  });

  const doctorOptions = [
    { value: '', label: 'All doctors' },
    ...(doctors || []).map((doc) => ({ value: String(doc.id), label: `Dr. ${doc.first_name} ${doc.last_name}` })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Appointments</h1>
          <p className="mt-1 text-muted">
            {role === 'PATIENT' ? 'Your scheduled and past appointments.' : 'Manage clinic appointments.'}
          </p>
        </div>
        {canSchedule && (
          <Link to="/appointments/new">
            <Button>Schedule Appointment</Button>
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            setPage(1);
          }}
          className="min-w-[160px]"
        />
        {(role === 'ADMIN' || role === 'RECEPTIONIST') && (
          <Select
            label="Doctor"
            options={doctorOptions}
            value={doctorId}
            onChange={(event) => {
              setDoctorId(event.target.value);
              setPage(1);
            }}
            className="min-w-[220px]"
          />
        )}
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="min-w-[180px]"
        />
        {(date || doctorId || status) && (
          <Button
            variant="secondary"
            onClick={() => {
              setDate('');
              setDoctorId('');
              setStatus('');
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {actionError && <Alert tone="danger">{actionError}</Alert>}

      {isLoading ? (
        <TableSkeleton columns={6} />
      ) : isError ? (
        <Alert tone="danger">
          Unable to load appointments.{' '}
          <button type="button" onClick={() => refetch()} className="underline">
            Try again
          </button>
        </Alert>
      ) : data.rows.length === 0 ? (
        <EmptyState
          title="No appointments found"
          description={date || doctorId || status ? 'Try adjusting your filters.' : 'Scheduled appointments will appear here.'}
          action={
            canSchedule && !(date || doctorId || status) ? (
              <Link to="/appointments/new">
                <Button>Schedule the first appointment</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className={`flex flex-col gap-4 ${isFetching ? 'opacity-70' : ''}`}>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border bg-surface-hover text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">When</th>
                  <th scope="col" className="px-4 py-3">Patient</th>
                  <th scope="col" className="px-4 py-3">Doctor</th>
                  <th scope="col" className="px-4 py-3">Type</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((appt) => {
                  const actions = getAvailableActions(appt.status, role);
                  return (
                    <tr key={appt.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                      <td className="px-4 py-3 text-text">{formatDateTime(appt.scheduled_at)}</td>
                      <td className="px-4 py-3 text-text">
                        {role === 'PATIENT' ? (
                          `${appt.patient_first_name} ${appt.patient_last_name}`
                        ) : (
                          <Link to={`/patients/${appt.patient_id}`} className="text-primary underline">
                            {appt.patient_first_name} {appt.patient_last_name}
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text">
                        Dr. {appt.doctor_first_name} {appt.doctor_last_name}
                      </td>
                      <td className="px-4 py-3 text-muted">{appt.type.replace('_', ' ')}</td>
                      <td className="px-4 py-3">
                        <Badge tone={STATUS_TONE[appt.status]}>{STATUS_LABEL[appt.status]}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {actions.map((action) => (
                            <button
                              key={action.next}
                              type="button"
                              disabled={statusMutation.isPending}
                              onClick={() => statusMutation.mutate({ id: appt.id, next: action.next })}
                              className={`rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-surface-hover disabled:opacity-50 ${
                                action.variant === 'danger' ? 'border-danger text-danger' : 'border-border text-text'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
