import { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner } from '../../components/Spinner.jsx';
import { Alert } from '../../components/Alert.jsx';
import { Button } from '../../components/Button.jsx';
import { TextField } from '../../components/TextField.jsx';
import { TextArea } from '../../components/TextArea.jsx';
import { Select } from '../../components/Select.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { extractErrorMessage } from '../../services/apiClient.js';
import { formatDate, calculateAge } from '../../utils/format.js';
import { getPatientById, getOwnPatient, updatePatient } from './patientsApi.js';
import { patientFormSchema, GENDER_OPTIONS, BLOOD_GROUP_OPTIONS } from './patientSchema.js';
import { MedicalHistorySection } from '../medicalRecords/MedicalHistorySection.jsx';

function toFormValues(patient) {
  return {
    firstName: patient.first_name,
    lastName: patient.last_name,
    dateOfBirth: patient.date_of_birth,
    gender: patient.gender,
    phone: patient.phone,
    email: patient.email || '',
    address: patient.address || '',
    emergencyContactName: patient.emergency_contact_name || '',
    emergencyContactPhone: patient.emergency_contact_phone || '',
    bloodGroup: patient.blood_group,
    allergies: patient.allergies || '',
  };
}

export default function PatientProfilePage({ ownMode = false }) {
  const { id } = useParams();
  const isOwn = ownMode;
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.user?.role);
  const canEdit = !isOwn && ['ADMIN', 'RECEPTIONIST'].includes(role);
  const [isEditing, setIsEditing] = useState(false);
  const [serverError, setServerError] = useState(null);

  const queryKey = ['patients', isOwn ? 'me' : id];
  const { data: patient, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => (isOwn ? getOwnPatient() : getPatientById(id)),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(patientFormSchema) });

  const mutation = useMutation({
    mutationFn: (values) => updatePatient(patient.id, values),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      setIsEditing(false);
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'Unable to save changes. Please try again.')),
  });

  const startEditing = () => {
    reset(toFormValues(patient));
    setServerError(null);
    setIsEditing(true);
  };

  if (isLoading) {
    return <Spinner label="Loading patient..." />;
  }

  if (isError || !patient) {
    return (
      <Alert tone="danger">
        Unable to load this patient record.{' '}
        <button type="button" onClick={() => refetch()} className="underline">
          Try again
        </button>
      </Alert>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        {!isOwn && (
          <Link to="/patients" className="text-sm text-primary underline">
            &larr; Back to patients
          </Link>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-text">
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="mt-1 text-muted">
              {patient.patient_code} &middot; {calculateAge(patient.date_of_birth)} yrs &middot; {patient.gender}
            </p>
          </div>
          {canEdit && !isEditing && <Button onClick={startEditing}>Edit details</Button>}
        </div>
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSubmit((values) => {
            setServerError(null);
            mutation.mutate(values);
          })}
          noValidate
          className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6 shadow-sm"
        >
          {serverError && <Alert tone="danger">{serverError}</Alert>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="First name" error={errors.firstName?.message} {...register('firstName')} />
            <TextField label="Last name" error={errors.lastName?.message} {...register('lastName')} />
            <TextField
              label="Date of birth"
              type="date"
              error={errors.dateOfBirth?.message}
              {...register('dateOfBirth')}
            />
            <Select label="Gender" options={GENDER_OPTIONS} error={errors.gender?.message} {...register('gender')} />
            <TextField label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
            <TextField label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Select
              label="Blood group"
              options={BLOOD_GROUP_OPTIONS}
              error={errors.bloodGroup?.message}
              {...register('bloodGroup')}
            />
          </div>

          <TextArea label="Address" error={errors.address?.message} {...register('address')} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Emergency contact name"
              error={errors.emergencyContactName?.message}
              {...register('emergencyContactName')}
            />
            <TextField
              label="Emergency contact phone"
              type="tel"
              error={errors.emergencyContactPhone?.message}
              {...register('emergencyContactPhone')}
            />
          </div>

          <TextArea label="Known allergies" error={errors.allergies?.message} {...register('allergies')} />

          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Date of birth" value={formatDate(patient.date_of_birth)} />
            <Field label="Phone" value={patient.phone} />
            <Field label="Email" value={patient.email || '—'} />
            <Field label="Blood group" value={patient.blood_group} />
            <Field label="Emergency contact" value={patient.emergency_contact_name || '—'} />
            <Field label="Emergency phone" value={patient.emergency_contact_phone || '—'} />
            <Field label="Address" value={patient.address || '—'} className="sm:col-span-2" />
            <Field label="Known allergies" value={patient.allergies || 'None recorded'} className="sm:col-span-2" />
            <Field label="Registered" value={formatDate(patient.created_at)} />
          </dl>
        </div>
      )}

      {['ADMIN', 'DOCTOR', 'PATIENT'].includes(role) && <MedicalHistorySection patientId={patient.id} />}
    </div>
  );
}

function Field({ label, value, className = '' }) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm text-text">{value}</dd>
    </div>
  );
}

PatientProfilePage.propTypes = {
  ownMode: PropTypes.bool,
};

Field.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  className: PropTypes.string,
};
