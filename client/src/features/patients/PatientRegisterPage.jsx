import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { TextField } from '../../components/TextField.jsx';
import { TextArea } from '../../components/TextArea.jsx';
import { Select } from '../../components/Select.jsx';
import { Button } from '../../components/Button.jsx';
import { Alert } from '../../components/Alert.jsx';
import { extractErrorMessage } from '../../services/apiClient.js';
import { registerPatient } from './patientsApi.js';
import { patientFormSchema, GENDER_OPTIONS, BLOOD_GROUP_OPTIONS } from './patientSchema.js';

export default function PatientRegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(patientFormSchema),
    defaultValues: { gender: 'MALE', bloodGroup: 'UNKNOWN' },
  });

  const onSubmit = async (values) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const patient = await registerPatient(values);
      navigate(`/patients/${patient.id}`, { replace: true });
    } catch (error) {
      setServerError(extractErrorMessage(error, 'Unable to register this patient. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link to="/patients" className="text-sm text-primary underline">
          &larr; Back to patients
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-text">Register Patient</h1>
        <p className="mt-1 text-muted">Only the information needed for clinic workflows is collected.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6 shadow-sm">
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
          <TextField label="Email (optional)" type="email" error={errors.email?.message} {...register('email')} />
          <Select
            label="Blood group"
            options={BLOOD_GROUP_OPTIONS}
            error={errors.bloodGroup?.message}
            {...register('bloodGroup')}
          />
        </div>

        <TextArea label="Address (optional)" error={errors.address?.message} {...register('address')} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Emergency contact name (optional)"
            error={errors.emergencyContactName?.message}
            {...register('emergencyContactName')}
          />
          <TextField
            label="Emergency contact phone (optional)"
            type="tel"
            error={errors.emergencyContactPhone?.message}
            {...register('emergencyContactPhone')}
          />
        </div>

        <TextArea
          label="Known allergies (optional)"
          error={errors.allergies?.message}
          {...register('allergies')}
        />

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/patients')}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Register patient
          </Button>
        </div>
      </form>
    </div>
  );
}
