import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { TextField } from '../../components/TextField.jsx';
import { TextArea } from '../../components/TextArea.jsx';
import { Select } from '../../components/Select.jsx';
import { Button } from '../../components/Button.jsx';
import { Alert } from '../../components/Alert.jsx';
import { Spinner } from '../../components/Spinner.jsx';
import { extractErrorMessage } from '../../services/apiClient.js';
import { PatientPicker } from './PatientPicker.jsx';
import { createAppointment } from './appointmentsApi.js';
import { appointmentFormSchema, APPOINTMENT_TYPE_OPTIONS } from './appointmentSchema.js';
import { listDoctors } from '../doctors/doctorsApi.js';
import { listDepartments } from '../departments/departmentsApi.js';

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function AppointmentCreatePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => listDoctors(),
  });
  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => listDepartments(),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: { date: todayIsoDate(), type: 'NEW_VISIT', durationMinutes: 30 },
  });

  const onSubmit = async (values) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const appointment = await createAppointment({
        patientId: values.patientId,
        doctorId: values.doctorId,
        departmentId: values.departmentId || undefined,
        scheduledAt: `${values.date}T${values.time}:00`,
        durationMinutes: values.durationMinutes,
        type: values.type,
        reason: values.reason,
      });
      navigate(`/appointments/${appointment.id}`, { replace: true });
    } catch (error) {
      setServerError(extractErrorMessage(error, 'Unable to create this appointment. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (doctorsLoading || departmentsLoading) {
    return <Spinner label="Loading form..." />;
  }

  const doctorOptions = [
    { value: '', label: 'Select a doctor' },
    ...(doctors || []).map((doc) => ({
      value: String(doc.id),
      label: `Dr. ${doc.first_name} ${doc.last_name} — ${doc.specialization}`,
    })),
  ];
  const departmentOptions = [
    { value: '', label: 'Not specified' },
    ...(departments || []).map((dept) => ({ value: String(dept.id), label: dept.name })),
  ];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link to="/appointments" className="text-sm text-primary underline">
          &larr; Back to appointments
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-text">Schedule Appointment</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6 shadow-sm"
      >
        {serverError && <Alert tone="danger">{serverError}</Alert>}

        <Controller
          name="patientId"
          control={control}
          render={({ field }) => (
            <PatientPicker value={field.value} onChange={field.onChange} error={errors.patientId?.message} />
          )}
        />

        <Select label="Doctor" options={doctorOptions} error={errors.doctorId?.message} {...register('doctorId')} />
        <Select
          label="Department (optional)"
          options={departmentOptions}
          error={errors.departmentId?.message}
          {...register('departmentId')}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Date" type="date" error={errors.date?.message} {...register('date')} />
          <TextField label="Time" type="time" error={errors.time?.message} {...register('time')} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Type"
            options={APPOINTMENT_TYPE_OPTIONS}
            error={errors.type?.message}
            {...register('type')}
          />
          <TextField
            label="Duration (minutes)"
            type="number"
            min={5}
            max={240}
            step={5}
            error={errors.durationMinutes?.message}
            {...register('durationMinutes')}
          />
        </div>

        <TextArea label="Reason (optional)" error={errors.reason?.message} {...register('reason')} />

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/appointments')}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Schedule appointment
          </Button>
        </div>
      </form>
    </div>
  );
}
