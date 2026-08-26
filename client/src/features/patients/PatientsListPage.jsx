import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { SearchInput } from '../../components/SearchInput.jsx';
import { Select } from '../../components/Select.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { TableSkeleton } from '../../components/TableSkeleton.jsx';
import { Alert } from '../../components/Alert.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { Button } from '../../components/Button.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { formatDate, calculateAge } from '../../utils/format.js';
import { listPatients } from './patientsApi.js';

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Registration date' },
  { value: 'name', label: 'Name' },
  { value: 'date_of_birth', label: 'Date of birth' },
];

export default function PatientsListPage() {
  const canRegister = ['ADMIN', 'RECEPTIONIST'].includes(useAuthStore((state) => state.user?.role));
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['patients', { search: debouncedSearch, page, sortBy }],
    queryFn: () => listPatients({ search: debouncedSearch || undefined, page, sortBy, sortDir: 'desc', pageSize: 15 }),
    placeholderData: (previous) => previous,
  });

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Patients</h1>
          <p className="mt-1 text-muted">Search, review, and manage patient records.</p>
        </div>
        {canRegister && (
          <Link to="/patients/new">
            <Button>Register Patient</Button>
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[240px] flex-1">
          <SearchInput
            label="Search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name, patient ID, phone, or email"
          />
        </div>
        <Select
          label="Sort by"
          className="min-w-[180px]"
          value={sortBy}
          onChange={(event) => {
            setSortBy(event.target.value);
            setPage(1);
          }}
          options={SORT_OPTIONS}
        />
      </div>

      {isLoading ? (
        <TableSkeleton columns={6} />
      ) : isError ? (
        <Alert tone="danger">
          Unable to load patients.{' '}
          <button type="button" onClick={() => refetch()} className="underline">
            Try again
          </button>
        </Alert>
      ) : data.rows.length === 0 ? (
        <EmptyState
          title={search ? 'No patients match your search' : 'No patients registered yet'}
          description={search ? 'Try a different name, ID, phone number, or email.' : 'Registered patients will appear here.'}
          action={
            canRegister && !search ? (
              <Link to="/patients/new">
                <Button>Register the first patient</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className={`flex flex-col gap-4 ${isFetching ? 'opacity-70' : ''}`}>
          <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-surface-hover text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">Patient ID</th>
                  <th scope="col" className="px-4 py-3">Name</th>
                  <th scope="col" className="px-4 py-3">Age / Gender</th>
                  <th scope="col" className="px-4 py-3">Phone</th>
                  <th scope="col" className="px-4 py-3">Blood group</th>
                  <th scope="col" className="px-4 py-3">Registered</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((patient) => (
                  <tr key={patient.id} className="border-b border-border last:border-0 hover:bg-surface-hover">
                    <td className="px-4 py-3">
                      <Link to={`/patients/${patient.id}`} className="font-medium text-primary underline">
                        {patient.patient_code}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text">
                      {patient.first_name} {patient.last_name}
                    </td>
                    <td className="px-4 py-3 text-text">
                      {calculateAge(patient.date_of_birth)} yrs &middot; {patient.gender}
                    </td>
                    <td className="px-4 py-3 text-text">{patient.phone}</td>
                    <td className="px-4 py-3 text-text">{patient.blood_group}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(patient.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            total={data.meta.total}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
