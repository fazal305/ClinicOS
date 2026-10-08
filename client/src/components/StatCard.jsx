import PropTypes from 'prop-types';

const ICONS = {
  patients: <path d="M10 3 2 7l8 4 8-4-8-4Zm-6 6.5V13c0 1.7 2.7 3 6 3s6-1.3 6-3V9.5" />,
  appointments: <path d="M5 3v2m10-2v2M4 7h12M4 5h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm3 6 2 2 4-4" />,
  doctors: <path d="M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4 17c0-2.8 2.7-5 6-5s6 2.2 6 5" />,
  visits: <path d="m4 10 4 4 8-8" />,
  payments: <path d="M10 3v14m4-11.5c0-1.4-1.8-2.5-4-2.5s-4 1.1-4 2.5S8 8 10 8s4 1.1 4 2.5-1.8 2.5-4 2.5-4-1.1-4-2.5" />,
  revenue: <path d="M3 15V9m4.5 6V6m4.5 9V3m4.5 12v-4.5" />,
}

export function StatCard({ label, value, hint, icon }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      {icon && (
        <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {ICONS[icon]}
          </svg>
        </span>
      )}
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-text">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  hint: PropTypes.string,
  icon: PropTypes.oneOf(Object.keys(ICONS)),
};
