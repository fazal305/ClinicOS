import PropTypes from 'prop-types';

const TONES = {
  neutral: 'bg-surface-hover text-muted',
  info: 'bg-surface-hover text-primary',
  warning: 'border border-warning text-warning',
  success: 'border border-success text-success',
  danger: 'border border-danger text-danger',
};

export function Badge({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]}`}>
      {children}
    </span>
  );
}

Badge.propTypes = {
  tone: PropTypes.oneOf(['neutral', 'info', 'warning', 'success', 'danger']),
  children: PropTypes.node.isRequired,
};
