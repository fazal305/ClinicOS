import PropTypes from 'prop-types';

export function TableSkeleton({ columns = 5, rows = 6 }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm" role="status" aria-label="Loading">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface-hover">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-3 w-16 animate-pulse rounded bg-border" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border last:border-0">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <div
                    className="h-3 animate-pulse rounded bg-border"
                    style={{ width: `${55 + ((rowIndex + colIndex) % 3) * 15}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

TableSkeleton.propTypes = {
  columns: PropTypes.number,
  rows: PropTypes.number,
};
