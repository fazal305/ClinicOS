import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <h1 className="text-2xl font-semibold text-text">Page not found</h1>
      <p className="max-w-sm text-muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="text-primary underline">
        Back to dashboard
      </Link>
    </div>
  );
}
