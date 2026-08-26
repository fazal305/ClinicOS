import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Spinner } from '../../components/Spinner.jsx';
import { Alert } from '../../components/Alert.jsx';
import { Button } from '../../components/Button.jsx';
import { Badge } from '../../components/Badge.jsx';
import { TextField } from '../../components/TextField.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { extractErrorMessage } from '../../services/apiClient.js';
import { getAppointmentById, rescheduleAppointment, updateAppointmentStatus } from './appointmentsApi.js';
import { STATUS_LABEL, STATUS_TONE, getAvailableActions } from './appointmentSchema.js';

const rescheduleSchema = z.object({
  date: z.string().min(1, 'Select a date'),
  time: z.string().min(1, 'Select a time'),
});

function formatDateTime(value) {
  return new Date(value).toLocaleString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const role = useAuthStore((state) => state.user?.role);
  const canManage = ['ADMIN', 'RECEPTIONIST'].includes(role);
  const queryClient = useQueryClient();
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [actionError, setActionError] = useState(null);

  const queryKey = ['appointments', id];
  const { data: appt, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => getAppointmentById(id),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(rescheduleSchema) });

  const rescheduleMutation = useMutation({
    mutationFn: (values) =>
      rescheduleAppointment(id, { scheduledAt: `${values.date}T${values.time}:00` }),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setIsRescheduling(false);
      setActionError(null);
    },
    onError: (error) => setActionError(extractErrorMessage(error, 'Unable to reschedule this appointment.')),
  });

  const statusMutation = useMutation({
    mutationFn: (next) => updateAppointmentStatus(id, next),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setActionError(null);
    },
    onError: (error) => setActionError(extractErrorMessage(error, 'Unable to update this appointment.')),
  });

  const startReschedule = () => {
    const current = new Date(appt.scheduled_at);
    reset({
      date: current.toISOString().slice(0, 10),
      time: current.toTimeString().slice(0, 5),
    });
    setActionError(null);
    setIsRescheduling(true);
  };

  if (isLoading) {
    return <Spinner label="Loading appointment..." />;
  }

  if (isError || !appt) {
    return (
      <Alert tone="danger">
        Unable to load this appointment.{' '}
        <button type="button" onClick={() => refetch()} className="underline">
          Try again
        </button>
      </Alert>
    );
  }

  const actions = getAvailableActions(appt.status, role);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link to="/appointments" className="text-sm text-primary underline">
          &larr; Back to appointments
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-text">{formatDateTime(appt.scheduled_at)}</h1>
          <Badge tone={STATUS_TONE[appt.status]}>{STATUS_LABEL[appt.status]}</Badge>
        </div>
      </div>

      {actionError && <Alert tone="danger">{actionError}</Alert>}

      <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted">Patient</dt>
            <dd className="text-sm text-text">
              {role === 'PATIENT' ? (
                `${appt.patient_first_name} ${appt.patient_last_name}`
              ) : (
                <Link to={`/patients/${appt.patient_id}`} className="text-primary underline">
                  {appt.patient_first_name} {appt.patient_last_name}
                </Link>
              )}{' '}
              ({appt.patient_code})
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Doctor</dt>
            <dd className="text-sm text-text">
              Dr. {appt.doctor_first_name} {appt.doctor_last_name}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Department</dt>
            <dd className="text-sm text-text">{appt.department_name || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Type</dt>
            <dd className="text-sm text-text">{appt.type.replace('_', ' ')}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Duration</dt>
            <dd className="text-sm text-text">{appt.duration_minutes} minutes</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted">Reason</dt>
            <dd className="text-sm text-text">{appt.reason || '—'}</dd>
          </div>
        </dl>
      </div>

      {isRescheduling ? (
        <form
          onSubmit={handleSubmit((values) => rescheduleMutation.mutate(values))}
          noValidate
          className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-text">Reschedule</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Date" type="date" error={errors.date?.message} {...register('date')} />
            <TextField label="Time" type="time" error={errors.time?.message} {...register('time')} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setIsRescheduling(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={rescheduleMutation.isPending}>
              Save new time
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          {role === 'DOCTOR' && appt.status === 'IN_PROGRESS' && (
            <Link to={`/appointments/${appt.id}/visit`}>
              <Button>Document Visit</Button>
            </Link>
          )}
          {canManage && !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appt.status) && (
            <Button variant="secondary" onClick={startReschedule}>
              Reschedule
            </Button>
          )}
          {actions.map((action) => (
            <Button
              key={action.next}
              variant={action.variant === 'danger' ? 'danger' : 'secondary'}
              loading={statusMutation.isPending}
              onClick={() => statusMutation.mutate(action.next)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
