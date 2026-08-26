import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '../../components/Spinner.jsx';
import { Alert } from '../../components/Alert.jsx';
import { Badge } from '../../components/Badge.jsx';
import { formatDate } from '../../utils/format.js';
import { listMedicalRecordsByPatient } from './medicalRecordsApi.js';
import { listPrescriptionsByPatient } from '../prescriptions/prescriptionsApi.js';
import { listAppointments } from '../appointments/appointmentsApi.js';
import { STATUS_LABEL, STATUS_TONE } from '../appointments/appointmentSchema.js';

export function MedicalHistorySection({ patientId }) {
  const appointmentsQuery = useQuery({
    queryKey: ['appointments', { patientId, history: true }],
    queryFn: () => listAppointments({ patientId, pageSize: 10 }),
  });
  const recordsQuery = useQuery({
    queryKey: ['medical-records', patientId],
    queryFn: () => listMedicalRecordsByPatient(patientId),
  });
  const prescriptionsQuery = useQuery({
    queryKey: ['prescriptions', patientId],
    queryFn: () => listPrescriptionsByPatient(patientId),
  });

  return (
    <div className="flex flex-col gap-6">
      <Section title="Appointment History">
        {appointmentsQuery.isLoading ? (
          <Spinner label="Loading appointments..." />
        ) : appointmentsQuery.isError ? (
          <Alert tone="danger">Unable to load appointment history.</Alert>
        ) : appointmentsQuery.data.rows.length === 0 ? (
          <EmptyNote text="No appointments recorded yet." />
        ) : (
          <ul className="flex flex-col gap-2">
            {appointmentsQuery.data.rows.map((appt) => (
              <li
                key={appt.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-4 py-3"
              >
                <span className="text-sm text-text">
                  {new Date(appt.scheduled_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  &middot; Dr. {appt.doctor_first_name} {appt.doctor_last_name}
                </span>
                <Badge tone={STATUS_TONE[appt.status]}>{STATUS_LABEL[appt.status]}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Medical Records">
        {recordsQuery.isLoading ? (
          <Spinner label="Loading medical records..." />
        ) : recordsQuery.isError ? (
          <Alert tone="danger">Unable to load medical records.</Alert>
        ) : recordsQuery.data.length === 0 ? (
          <EmptyNote text="No medical records yet." />
        ) : (
          <ul className="flex flex-col gap-3">
            {recordsQuery.data.map((record) => (
              <li key={record.id} className="rounded-md border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-text">{formatDate(record.visit_date)}</span>
                  <span className="text-xs text-muted">
                    Dr. {record.doctor_first_name} {record.doctor_last_name}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <Field label="Chief complaint" value={record.chief_complaint} />
                  <Field label="Diagnosis" value={record.diagnosis} />
                  {record.symptoms && <Field label="Symptoms" value={record.symptoms} className="sm:col-span-2" />}
                  {record.clinical_notes && (
                    <Field label="Clinical notes" value={record.clinical_notes} className="sm:col-span-2" />
                  )}
                  {record.treatment_plan && (
                    <Field label="Treatment plan" value={record.treatment_plan} className="sm:col-span-2" />
                  )}
                  {record.follow_up_date && <Field label="Follow-up" value={formatDate(record.follow_up_date)} />}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Prescriptions">
        {prescriptionsQuery.isLoading ? (
          <Spinner label="Loading prescriptions..." />
        ) : prescriptionsQuery.isError ? (
          <Alert tone="danger">Unable to load prescriptions.</Alert>
        ) : prescriptionsQuery.data.length === 0 ? (
          <EmptyNote text="No prescriptions yet." />
        ) : (
          <ul className="flex flex-col gap-3">
            {prescriptionsQuery.data.map((prescription) => (
              <li key={prescription.id} className="rounded-md border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-text">{formatDate(prescription.prescribed_date)}</span>
                  <span className="text-xs text-muted">
                    Dr. {prescription.doctor_first_name} {prescription.doctor_last_name}
                  </span>
                </div>
                <table className="mt-3 w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th scope="col" className="py-1 pr-3">Medicine</th>
                      <th scope="col" className="py-1 pr-3">Dosage</th>
                      <th scope="col" className="py-1 pr-3">Frequency</th>
                      <th scope="col" className="py-1 pr-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescription.items.map((item) => (
                      <tr key={item.id} className="border-t border-border">
                        <td className="py-1.5 pr-3 text-text">{item.medicine_name}</td>
                        <td className="py-1.5 pr-3 text-text">{item.dosage}</td>
                        <td className="py-1.5 pr-3 text-text">{item.frequency}</td>
                        <td className="py-1.5 pr-3 text-text">{item.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {prescription.notes && <p className="mt-2 text-sm text-muted">{prescription.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

MedicalHistorySection.propTypes = {
  patientId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

function Section({ title, children }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
      {children}
    </div>
  );
}

Section.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

function EmptyNote({ text }) {
  return <p className="text-sm text-muted">{text}</p>;
}

EmptyNote.propTypes = {
  text: PropTypes.string.isRequired,
};

function Field({ label, value, className = '' }) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-text">{value}</dd>
    </div>
  );
}

Field.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  className: PropTypes.string,
};
