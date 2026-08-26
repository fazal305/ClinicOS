import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TableSkeleton } from '../../components/TableSkeleton.jsx';
import { Alert } from '../../components/Alert.jsx';
import { Button } from '../../components/Button.jsx';
import { TextField } from '../../components/TextField.jsx';
import { Badge } from '../../components/Badge.jsx';
import { extractErrorMessage } from '../../services/apiClient.js';
import { listReceptionists, createReceptionist, updateReceptionist } from './receptionistsApi.js';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  initialPassword: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  phone: z.string().trim().optional(),
});

export default function ReceptionistsManagementPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [serverError, setServerError] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['receptionists'],
    queryFn: listReceptionists,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: createReceptionist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptionists'] });
      reset();
      setShowForm(false);
      setServerError(null);
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'Unable to create receptionist account.')),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateReceptionist(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['receptionists'] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Receptionists</h1>
          <p className="mt-1 text-muted">Manage front-desk staff accounts.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'Add Receptionist'}</Button>
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
            <TextField label="Phone (optional)" type="tel" error={errors.phone?.message} {...register('phone')} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={createMutation.isPending}>
              Create receptionist account
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <TableSkeleton columns={5} />
      ) : isError ? (
        <Alert tone="danger">
          Unable to load receptionists.{' '}
          <button type="button" onClick={() => refetch()} className="underline">
            Try again
          </button>
        </Alert>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-border bg-surface-hover text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-4 py-3">Name</th>
                <th scope="col" className="px-4 py-3">Email</th>
                <th scope="col" className="px-4 py-3">Phone</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                  <td className="px-4 py-3 font-medium text-text">
                    {r.first_name} {r.last_name}
                  </td>
                  <td className="px-4 py-3 text-muted">{r.email}</td>
                  <td className="px-4 py-3 text-text">{r.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge tone={r.status === 'ACTIVE' ? 'success' : 'neutral'}>{r.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={statusMutation.isPending}
                      onClick={() =>
                        statusMutation.mutate({ id: r.id, status: r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })
                      }
                      className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-text hover:bg-surface-hover disabled:opacity-50"
                    >
                      {r.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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
