import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/Button.jsx';
import { TextField } from '../../components/TextField.jsx';
import { Alert } from '../../components/Alert.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { loginRequest } from './authApi.js';
import { homePathForRole } from './roleHome.js';
import { extractErrorMessage } from '../../services/apiClient.js';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setServerError(null);
    setSubmitting(true);
    try {
      const { accessToken, user } = await loginRequest(values.email, values.password);
      setSession(accessToken, user);
      const redirectTo = location.state?.from || homePathForRole(user.role);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(extractErrorMessage(error, 'Unable to sign in. Check your credentials and try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-text">ClinicOS</h1>
          <p className="mt-1 text-sm text-muted">Sign in to your clinic account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          {serverError && <Alert tone="danger">{serverError}</Alert>}

          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" loading={submitting} className="mt-2 w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Demo system with fictional data only. Ask your administrator for account access.
        </p>
      </div>
    </div>
  );
}
