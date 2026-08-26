import { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { SearchInput } from '../../components/SearchInput.jsx';
import { Spinner } from '../../components/Spinner.jsx';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { listPatients } from '../patients/patientsApi.js';

export function PatientPicker({ value, onChange, error }) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['patients', 'picker', debouncedSearch],
    queryFn: () => listPatients({ search: debouncedSearch, pageSize: 6 }),
    enabled: debouncedSearch.length > 0,
  });

  const handleSelect = (patient) => {
    setSelected(patient);
    setSearch('');
    onChange(patient.id);
  };

  const handleClear = () => {
    setSelected(null);
    onChange(undefined);
  };

  if (selected || value) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text">Patient</span>
        <div className="flex items-center justify-between rounded-md border border-border bg-surface-hover px-3 py-2 text-sm">
          <span className="text-text">
            {selected ? `${selected.first_name} ${selected.last_name} (${selected.patient_code})` : `Patient #${value}`}
          </span>
          <button type="button" onClick={handleClear} className="text-primary underline">
            Change
          </button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <SearchInput label="Patient" value={search} onChange={setSearch} placeholder="Search by name, ID, or phone" />
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {debouncedSearch && (
        <div className="rounded-md border border-border bg-surface shadow-sm">
          {isLoading ? (
            <Spinner label="Searching..." />
          ) : data?.rows.length ? (
            <ul>
              {data.rows.map((patient) => (
                <li key={patient.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(patient)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface-hover"
                  >
                    <span className="text-text">
                      {patient.first_name} {patient.last_name}
                    </span>
                    <span className="text-muted">{patient.patient_code}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2 text-sm text-muted">No patients match &ldquo;{debouncedSearch}&rdquo;.</p>
          )}
        </div>
      )}
    </div>
  );
}

PatientPicker.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};
