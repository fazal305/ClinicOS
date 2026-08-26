import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TableSkeleton } from '../../components/TableSkeleton.jsx';
import { Alert } from '../../components/Alert.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { listAuditLogs } from './auditLogsApi.js';

function formatTimestamp(value) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function actionLabel(action) {
  return action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: () => listAuditLogs({ page, pageSize: 25 }),
    placeholderData: (previous) => previous,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Audit Log</h1>
        <p className="mt-1 text-muted">A record of significant administrative and clinical actions.</p>
      </div>

      {isLoading ? (
        <TableSkeleton columns={4} />
      ) : isError ? (
        <Alert tone="danger">
          Unable to load the audit log.{' '}
          <button type="button" onClick={() => refetch()} className="underline">
            Try again
          </button>
        </Alert>
      ) : data.rows.length === 0 ? (
        <EmptyState title="No activity recorded yet" description="Administrative and clinical actions will appear here." />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-border bg-surface-hover text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">When</th>
                  <th scope="col" className="px-4 py-3">User</th>
                  <th scope="col" className="px-4 py-3">Action</th>
                  <th scope="col" className="px-4 py-3">Entity</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                    <td className="px-4 py-3 text-muted">{formatTimestamp(log.created_at)}</td>
                    <td className="px-4 py-3 text-text">{log.user_email || 'System'}</td>
                    <td className="px-4 py-3 text-text">{actionLabel(log.action)}</td>
                    <td className="px-4 py-3 text-muted">
                      {log.entity_type}
                      {log.entity_id ? ` #${log.entity_id}` : ''}
                    </td>
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
