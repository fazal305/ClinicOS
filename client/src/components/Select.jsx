import PropTypes from 'prop-types';
import { forwardRef, useId } from 'react';

export const Select = forwardRef(function Select({ label, error, options, className = '', ...rest }, ref) {
  const generatedId = useId();
  const selectId = rest.id || generatedId;
  const errorId = `${selectId}-error`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={selectId} className="text-sm font-medium text-text">
        {label}
      </label>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-md border bg-surface px-3 py-2 text-sm text-text
          focus:outline-none focus:ring-2 focus:ring-primary
          ${error ? 'border-danger' : 'border-border'}`}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
});

Select.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.string.isRequired })
  ).isRequired,
  className: PropTypes.string,
};
