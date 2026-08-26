import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '../../components/Spinner.jsx';
import { Alert } from '../../components/Alert.jsx';
import { Button } from '../../components/Button.jsx';
import { TextField } from '../../components/TextField.jsx';
import { TextArea } from '../../components/TextArea.jsx';
import { extractErrorMessage } from '../../services/apiClient.js';
import { getAppointmentById, updateAppointmentStatus } from './appointmentsApi.js';
import { createMedicalRecord } from '../medicalRecords/medicalRecordsApi.js';
import { createPrescription } from '../prescriptions/prescriptionsApi.js';
import { visitFormSchema } from './visitSchema.js';

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function VisitDocumentationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: appt, isLoading, isError, refetch } = useQuery({
    queryKey: ['appointments', id],
    queryFn: () => getAppointmentById(id),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(visitFormSchema),
    defaultValues: { items: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onSubmit = async (values) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const record = await createMedicalRecord({
        patientId: appt.patient_id,
        appointmentId: appt.id,
        visitDate: todayIsoDate(),
        chiefComplaint: values.chiefComplaint,
        symptoms: values.symptoms || undefined,
        diagnosis: values.diagnosis,
        clinicalNotes: values.clinicalNotes || undefined,
        treatmentPlan: values.treatmentPlan || undefined,
        followUpDate: values.followUpDate || undefined,
      });

      if (values.items.length > 0) {
        await createPrescription({
          patientId: appt.patient_id,
          medicalRecordId: record.id,
          prescribedDate: todayIsoDate(),
          notes: values.prescriptionNotes || undefined,
          items: values.items,
        });
      }

      await updateAppointmentStatus(appt.id, 'COMPLETED');
      navigate(`/patients/${appt.patient_id}`, { replace: true });
    } catch (error) {
      setServerError(extractErrorMessage(error, 'Unable to save this visit. Please try again.'));
    } finally {
      setSubmitting(false);
    }
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

  if (appt.status !== 'IN_PROGRESS') {
    return (
      <Alert tone="warning">
        This appointment is not in progress, so a visit can&rsquo;t be documented right now.{' '}
        <Link to={`/appointments/${appt.id}`} className="underline">
          View appointment
        </Link>
      </Alert>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link to={`/appointments/${appt.id}`} className="text-sm text-primary underline">
          &larr; Back to appointment
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-text">Document Visit</h1>
        <p className="mt-1 text-muted">
          {appt.patient_first_name} {appt.patient_last_name} ({appt.patient_code})
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
        {serverError && <Alert tone="danger">{serverError}</Alert>}

        <fieldset className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-sm">
          <legend className="px-1 text-sm font-semibold text-text">Medical Record</legend>
          <TextArea
            label="Chief complaint"
            error={errors.chiefComplaint?.message}
            {...register('chiefComplaint')}
          />
          <TextArea label="Symptoms (optional)" error={errors.symptoms?.message} {...register('symptoms')} />
          <TextArea label="Diagnosis" error={errors.diagnosis?.message} {...register('diagnosis')} />
          <TextArea
            label="Clinical notes (optional)"
            error={errors.clinicalNotes?.message}
            {...register('clinicalNotes')}
          />
          <TextArea
            label="Treatment plan (optional)"
            error={errors.treatmentPlan?.message}
            {...register('treatmentPlan')}
          />
          <TextField
            label="Follow-up date (optional)"
            type="date"
            error={errors.followUpDate?.message}
            {...register('followUpDate')}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-sm">
          <legend className="px-1 text-sm font-semibold text-text">Prescription (optional)</legend>

          {fields.length === 0 && <p className="text-sm text-muted">No medicines added yet.</p>}

          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-3 rounded-md border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">Medicine {index + 1}</span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-xs font-medium text-danger underline"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField
                  label="Medicine"
                  error={errors.items?.[index]?.medicineName?.message}
                  {...register(`items.${index}.medicineName`)}
                />
                <TextField
                  label="Dosage"
                  placeholder="e.g. 500 mg"
                  error={errors.items?.[index]?.dosage?.message}
                  {...register(`items.${index}.dosage`)}
                />
                <TextField
                  label="Frequency"
                  placeholder="e.g. 2 times/day"
                  error={errors.items?.[index]?.frequency?.message}
                  {...register(`items.${index}.frequency`)}
                />
                <TextField
                  label="Duration"
                  placeholder="e.g. 3 days"
                  error={errors.items?.[index]?.duration?.message}
                  {...register(`items.${index}.duration`)}
                />
              </div>
              <TextField
                label="Instructions (optional)"
                placeholder="e.g. After meals"
                {...register(`items.${index}.instructions`)}
              />
            </div>
          ))}

          <Button
            variant="secondary"
            type="button"
            onClick={() => append({ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' })}
          >
            Add medicine
          </Button>

          {fields.length > 0 && (
            <TextArea
              label="Prescription notes (optional)"
              error={errors.prescriptionNotes?.message}
              {...register('prescriptionNotes')}
            />
          )}
        </fieldset>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate(`/appointments/${appt.id}`)}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Save &amp; complete visit
          </Button>
        </div>
      </form>
    </div>
  );
}
