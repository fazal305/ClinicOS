import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Spinner } from '../../components/Spinner.jsx';
import { Alert } from '../../components/Alert.jsx';
import { StatCard } from '../../components/StatCard.jsx';
import { useChartTheme } from '../../utils/chartTheme.js';
import { formatShortDate, formatCurrency } from '../../utils/format.js';
import { getOverview } from './reportsApi.js';

function ChartCard({ title, children }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-text">{title}</h2>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default function AdminDashboardPage() {
  const theme = useChartTheme();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reports', 'overview'],
    queryFn: getOverview,
  });

  if (isLoading) {
    return <Spinner label="Loading dashboard..." />;
  }

  if (isError || !data) {
    return (
      <Alert tone="danger">
        Unable to load the dashboard.{' '}
        <button type="button" onClick={() => refetch()} className="underline">
          Try again
        </button>
      </Alert>
    );
  }

  const { cards, charts } = data;
  const appointmentsSeries = charts.appointmentsOverTime.map((d) => ({ ...d, label: formatShortDate(d.date) }));
  const patientsSeries = charts.patientsRegisteredOverTime.map((d) => ({ ...d, label: formatShortDate(d.date) }));
  const revenueSeries = charts.revenueOverTime.map((d) => ({ ...d, label: formatShortDate(d.date), total: Number(d.total) }));

  const tooltipStyle = {
    backgroundColor: 'var(--color-surface)',
    border: `1px solid ${theme.border}`,
    borderRadius: 8,
    fontSize: 12,
    color: theme.text,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Admin Dashboard</h1>
        <p className="mt-1 text-muted">Clinic operations at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Today's Appointments" value={cards.todaysAppointments} />
        <StatCard label="Total Patients" value={cards.totalPatients} />
        <StatCard label="Active Doctors" value={cards.activeDoctors} />
        <StatCard label="Completed Visits Today" value={cards.completedVisitsToday} />
        <StatCard
          label="Pending Payments"
          value={cards.pendingPaymentsCount}
          hint={formatCurrency(cards.pendingPaymentsAmount)}
        />
        <StatCard label="Total Revenue" value={formatCurrency(cards.totalRevenue)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Appointments (last 14 days)">
          {appointmentsSeries.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={appointmentsSeries} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: theme.muted }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: theme.muted }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" name="Appointments" stroke={theme.primary} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Patients registered (last 14 days)">
          {patientsSeries.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patientsSeries} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: theme.muted }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: theme.muted }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" name="Patients" stroke={theme.success} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Revenue (last 14 days)">
          {revenueSeries.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueSeries} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: theme.muted }} />
                <YAxis tick={{ fontSize: 12, fill: theme.muted }} tickFormatter={(v) => formatCurrency(v)} width={80} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="total" name="Revenue" stroke={theme.warning} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Appointments by doctor">
          {charts.appointmentsByDoctor.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.appointmentsByDoctor} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: theme.muted }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: theme.muted }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Appointments" fill={theme.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Appointments by department">
        {charts.appointmentsByDepartment.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.appointmentsByDepartment} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: theme.muted }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: theme.muted }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Appointments" fill={theme.success} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}

function EmptyChart() {
  return <div className="flex h-full items-center justify-center text-sm text-muted">No data yet</div>;
}
