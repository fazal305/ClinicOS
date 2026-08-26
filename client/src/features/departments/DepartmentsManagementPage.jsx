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
import { listDepartments, createDepartment, updateDepartment } from './departmentsApi.js';

const schema = z.object({
  name: z.string().trim().min(1, 'Department name is required').max(120),
  description: z.string().trim().max(500).optional(),
});

export default function DepartmentsManagementPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [serverError, setServerError] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['departments', 'admin'],
    queryFn: () => listDepartments(true),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      reset();
      setShowForm(false);
      setServerError(null);
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'Unable to create department.')),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => updateDepartment(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Departments</h1>
          <p className="mt-1 text-muted">Manage the clinical departments patients and doctors are organized under.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'Add Department'}</Button>
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
            <TextField label="Name" error={errors.name?.message} {...register('name')} />
            <TextField label="Description (optional)" error={errors.description?.message} {...register('description')} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={createMutation.isPending}>
              Create department
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <TableSkeleton columns={4} />
      ) : isError ? (
        <Alert tone="danger">
          Unable to load departments.{' '}
          <button type="button" onClick={() => refetch()} className="underline">
            Try again
          </button>
        </Alert>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-border bg-surface-hover text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-4 py-3">Name</th>
                <th scope="col" className="px-4 py-3">Description</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((dept) => (
                <tr key={dept.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                  <td className="px-4 py-3 font-medium text-text">{dept.name}</td>
                  <td className="px-4 py-3 text-muted">{dept.description || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge tone={dept.is_active ? 'success' : 'neutral'}>{dept.is_active ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={toggleMutation.isPending}
                      onClick={() => toggleMutation.mutate({ id: dept.id, isActive: !dept.is_active })}
                      className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-text hover:bg-surface-hover disabled:opacity-50"
                    >
                      {dept.is_active ? 'Deactivate' : 'Activate'}
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
