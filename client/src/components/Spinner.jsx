import PropTypes from 'prop-types';

export function Spinner({ label = 'Loading' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-8 text-muted">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

Spinner.propTypes = {
  label: PropTypes.string,
};
