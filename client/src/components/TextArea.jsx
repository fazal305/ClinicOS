import PropTypes from 'prop-types';
import { forwardRef, useId } from 'react';

export const TextArea = forwardRef(function TextArea({ label, error, className = '', ...rest }, ref) {
  const generatedId = useId();
  const fieldId = rest.id || generatedId;
  const errorId = `${fieldId}-error`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={fieldId} className="text-sm font-medium text-text">
        {label}
      </label>
      <textarea
        ref={ref}
        id={fieldId}
        rows={3}
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

TextArea.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  className: PropTypes.string,
};
