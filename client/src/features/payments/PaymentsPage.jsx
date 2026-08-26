import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TableSkeleton } from '../../components/TableSkeleton.jsx';
import { Alert } from '../../components/Alert.jsx';
import { Button } from '../../components/Button.jsx';
import { TextField } from '../../components/TextField.jsx';
import { Select } from '../../components/Select.jsx';
import { Badge } from '../../components/Badge.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { extractErrorMessage } from '../../services/apiClient.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { PatientPicker } from '../appointments/PatientPicker.jsx';
import { listPayments, createPayment, updatePaymentStatus } from './paymentsApi.js';

const METHOD_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'OTHER', label: 'Other' },
];

const STATUS_LABEL = { PENDING: 'Pending', PAID: 'Paid', PARTIAL: 'Partial', REFUNDED: 'Refunded' };
const STATUS_TONE = { PENDING: 'warning', PAID: 'success', PARTIAL: 'info', REFUNDED: 'danger' };
const STATUS_OPTIONS = [{ value: '', label: 'All statuses' }, ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))];

const schema = z.object({
  patientId: z.coerce.number({ invalid_type_error: 'Select a patient' }).int().positive('Select a patient'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  method: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'OTHER']),
  status: z.enum(['PENDING', 'PAID', 'PARTIAL', 'REFUNDED']).optional().default('PENDING'),
});

export default function PaymentsPage() {
  const role = useAuthStore((state) => state.user?.role);
  const canManage = ['ADMIN', 'RECEPTIONIST'].includes(role);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [serverError, setServerError] = useState(null);

  const filters = { status: status || undefined, page };
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['payments', filters],
    queryFn: () => listPayments(filters),
    placeholderData: (previous) => previous,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { method: 'CASH', status: 'PENDING' } });

  const createMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      reset();
      setShowForm(false);
      setServerError(null);
    },
    onError: (error) => setServerError(extractErrorMessage(error, 'Unable to record this payment.')),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }) => updatePaymentStatus(id, next),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Payments</h1>
          <p className="mt-1 text-muted">
            {role === 'PATIENT' ? 'Your invoices and payment history.' : 'Track patient invoices and payment status.'}
          </p>
        </div>
        {canManage && <Button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'Record Payment'}</Button>}
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
          <Controller
            name="patientId"
            control={control}
            render={({ field }) => (
              <PatientPicker value={field.value} onChange={field.onChange} error={errors.patientId?.message} />
            )}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField label="Amount" type="number" step="0.01" min="0" error={errors.amount?.message} {...register('amount')} />
            <Select label="Method" options={METHOD_OPTIONS} error={errors.method?.message} {...register('method')} />
            <Select
              label="Status"
              options={STATUS_OPTIONS.slice(1)}
              error={errors.status?.message}
              {...register('status')}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={createMutation.isPending}>
              Record payment
            </Button>
          </div>
        </form>
      )}

      <Select
        label="Filter by status"
        options={STATUS_OPTIONS}
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setPage(1);
        }}
        className="max-w-xs"
      />

      {isLoading ? (
        <TableSkeleton columns={5} />
      ) : isError ? (
        <Alert tone="danger">
          Unable to load payments.{' '}
          <button type="button" onClick={() => refetch()} className="underline">
            Try again
          </button>
        </Alert>
      ) : data.rows.length === 0 ? (
        <EmptyState title="No payments found" description="Recorded payments will appear here." />
      ) : (
        <div className={`flex flex-col gap-4 ${isFetching ? 'opacity-70' : ''}`}>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-surface-hover text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">Date</th>
                  {role !== 'PATIENT' && <th scope="col" className="px-4 py-3">Patient</th>}
                  <th scope="col" className="px-4 py-3">Amount</th>
                  <th scope="col" className="px-4 py-3">Method</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  {canManage && <th scope="col" className="px-4 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((payment) => (
                  <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                    <td className="px-4 py-3 text-text">{formatDate(payment.created_at)}</td>
                    {role !== 'PATIENT' && (
                      <td className="px-4 py-3 text-text">
                        {payment.patient_first_name} {payment.patient_last_name}
                      </td>
                    )}
                    <td className="px-4 py-3 text-text">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3 text-muted">{payment.method.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[payment.status]}>{STATUS_LABEL[payment.status]}</Badge>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {payment.status !== 'PAID' && (
                            <button
                              type="button"
                              disabled={statusMutation.isPending}
                              onClick={() => statusMutation.mutate({ id: payment.id, next: 'PAID' })}
                              className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-text hover:bg-surface-hover disabled:opacity-50"
                            >
                              Mark paid
                            </button>
                          )}
                          {payment.status === 'PAID' && (
                            <button
                              type="button"
                              disabled={statusMutation.isPending}
                              onClick={() => statusMutation.mutate({ id: payment.id, next: 'REFUNDED' })}
                              className="rounded-md border border-danger px-2.5 py-1 text-xs font-medium text-danger hover:bg-surface-hover disabled:opacity-50"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
