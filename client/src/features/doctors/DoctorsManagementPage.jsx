import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TableSkeleton } from '../../components/TableSkeleton.jsx';
import { Alert } from '../../components/Alert.jsx';
import { Button } from '../../components/Button.jsx';
import { TextField } from '../../components/TextField.jsx';
import { Select } from '../../components/Select.jsx';
import { Badge } from '../../components/Badge.jsx';
import { extractErrorMessage } from '../../services/apiClient.js';
import { listAllDoctors, createDoctor, updateDoctor } from './doctorsApi.js';
import { listDepartments } from '../departments/departmentsApi.js';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  initialPassword: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  specialization: z.string().trim().min(1, 'Specialization is required'),
  departmentId: z.string().optional(),
  phone: z.string().trim().optional(),
});

export default function DoctorsManagementPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [serverError, setServerError] = useState(null);

  const { data: doctors, isLoading, isError, refetch } = useQuery({
    queryKey: ['doctors', 'admin'],
    queryFn: listAllDoctors,
  });
  const { data: departments } = useQuery({ queryKey: ['departments', 'admin'], queryFn: () => listDepartments(true) });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: (values) =>
      createDoctor({ ...values, departmentId: values.departmentId ? Number(values.departmentId) : undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      reset();
      setShowForm(false);
      setServerError(null);
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'Unable to create doctor account.')),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateDoctor(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctors'] }),
  });

  const departmentOptions = [
    { value: '', label: 'Unassigned' },
    ...(departments || []).map((d) => ({ value: String(d.id), label: d.name })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Doctors</h1>
          <p className="mt-1 text-muted">Manage doctor accounts and department assignments.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'Add Doctor'}</Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit((values) => {
            setServerError(null);
            createMutation.mutate(values);
          })}
          noValidate
          className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm"
        >
          {serverError && <Alert tone="danger">{serverError}</Alert>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="First name" error={errors.firstName?.message} {...register('firstName')} />
            <TextField label="Last name" error={errors.lastName?.message} {...register('lastName')} />
            <TextField label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <TextField
              label="Temporary password"
              type="password"
              error={errors.initialPassword?.message}
              {...register('initialPassword')}
            />
            <TextField label="Specialization" error={errors.specialization?.message} {...register('specialization')} />
            <Select label="Department" options={departmentOptions} error={errors.departmentId?.message} {...register('departmentId')} />
            <TextField label="Phone (optional)" type="tel" error={errors.phone?.message} {...register('phone')} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={createMutation.isPending}>
              Create doctor account
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <TableSkeleton columns={6} />
      ) : isError ? (
        <Alert tone="danger">
          Unable to load doctors.{' '}
          <button type="button" onClick={() => refetch()} className="underline">
            Try again
          </button>
        </Alert>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-surface-hover text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-4 py-3">Name</th>
                <th scope="col" className="px-4 py-3">Email</th>
                <th scope="col" className="px-4 py-3">Specialization</th>
                <th scope="col" className="px-4 py-3">Department</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                  <td className="px-4 py-3 font-medium text-text">
                    Dr. {doc.first_name} {doc.last_name}
                  </td>
                  <td className="px-4 py-3 text-muted">{doc.email}</td>
                  <td className="px-4 py-3 text-text">{doc.specialization}</td>
                  <td className="px-4 py-3 text-text">{doc.department_name || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge tone={doc.status === 'ACTIVE' ? 'success' : 'neutral'}>{doc.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={statusMutation.isPending}
                      onClick={() =>
                        statusMutation.mutate({ id: doc.id, status: doc.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })
                      }
                      className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-text hover:bg-surface-hover disabled:opacity-50"
                    >
                      {doc.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
