import PropTypes from 'prop-types';

export function SearchInput({ value, onChange, placeholder = 'Search...', label }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor="search-input" className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted" aria-hidden="true">
          ⌕
        </span>
        <input
          id="search-input"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={label || placeholder}
          className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text
            placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
};
