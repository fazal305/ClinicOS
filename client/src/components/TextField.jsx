import PropTypes from 'prop-types';
import { forwardRef, useId } from 'react';

export const TextField = forwardRef(function TextField(
  { label, error, type = 'text', className = '', ...rest },
  ref
) {
  const generatedId = useId();
  const inputId = rest.id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-medium text-text">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-md border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted
          focus:outline-none focus:ring-2 focus:ring-primary
          ${error ? 'border-danger' : 'border-border'}`}
        {...rest}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
});

TextField.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  type: PropTypes.string,
  className: PropTypes.string,
};
