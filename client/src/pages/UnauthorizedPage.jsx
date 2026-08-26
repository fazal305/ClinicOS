import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <h1 className="text-2xl font-semibold text-text">Access denied</h1>
      <p className="max-w-sm text-muted">Your account role does not have permission to view this page.</p>
      <Link to="/" className="text-primary underline">
        Back to dashboard
      </Link>
    </div>
  );
}
