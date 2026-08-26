import PropTypes from 'prop-types';

const VARIANTS = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'bg-transparent text-text border border-border hover:bg-surface-hover',
  danger: 'bg-danger text-white hover:opacity-90',
  ghost: 'bg-transparent text-text hover:bg-surface-hover',
};

export function Button({ children, variant = 'primary', type = 'button', loading, disabled, className = '', ...rest }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium
        transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60
        ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
