import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TableSkeleton } from '../../components/TableSkeleton.jsx';
import { Alert } from '../../components/Alert.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { Badge } from '../../components/Badge.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { extractErrorMessage } from '../../services/apiClient.js';
import { listAppointments, updateAppointmentStatus } from './appointmentsApi.js';
import { STATUS_LABEL, STATUS_TONE, getAvailableActions } from './appointmentSchema.js';

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function TodaysQueuePage() {
  const role = useAuthStore((state) => state.user?.role);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['appointments', { date: todayIsoDate(), queue: true }],
    queryFn: () => listAppointments({ date: todayIsoDate(), pageSize: 100 }),
    refetchInterval: 30_000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }) => updateAppointmentStatus(id, next),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Today&rsquo;s Queue</h1>
        <p className="mt-1 text-muted">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton columns={6} />
      ) : isError ? (
        <Alert tone="danger">
          Unable to load the queue.{' '}
          <button type="button" onClick={() => refetch()} className="underline">
            Try again
          </button>
        </Alert>
      ) : data.rows.length === 0 ? (
        <EmptyState title="No appointments today" description="Appointments scheduled for today will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-surface-hover text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-4 py-3">#</th>
                <th scope="col" className="px-4 py-3">Patient</th>
                <th scope="col" className="px-4 py-3">Doctor</th>
                <th scope="col" className="px-4 py-3">Time</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((appt, index) => {
                const actions = getAvailableActions(appt.status, role);
                return (
                  <tr key={appt.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                    <td className="px-4 py-3 text-muted">{index + 1}</td>
                    <td className="px-4 py-3">
                      <Link to={`/patients/${appt.patient_id}`} className="text-primary underline">
                        {appt.patient_first_name} {appt.patient_last_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text">
                      Dr. {appt.doctor_first_name} {appt.doctor_last_name}
                    </td>
                    <td className="px-4 py-3 text-text">{formatTime(appt.scheduled_at)}</td>
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
                        <Link
                          to={`/appointments/${appt.id}`}
                          className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-text hover:bg-surface-hover"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
