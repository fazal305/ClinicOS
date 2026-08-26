import PropTypes from 'prop-types';

const TONES = {
  danger: 'text-danger border-danger',
  warning: 'text-warning border-warning',
  success: 'text-success border-success',
};

export function Alert({ tone = 'danger', children }) {
  return (
    <div
      role="alert"
      className={`rounded-md border-l-4 bg-surface px-3 py-2 text-sm shadow-sm ${TONES[tone]}`}
    >
      {children}
    </div>
  );
}

Alert.propTypes = {
  tone: PropTypes.oneOf(['danger', 'warning', 'success']),
  children: PropTypes.node.isRequired,
};
