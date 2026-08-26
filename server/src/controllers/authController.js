import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { loginSchema } from '../validators/authValidators.js';
import * as authService from '../services/authService.js';
import { env } from '../config/env.js';

const REFRESH_COOKIE = 'clinicos_refresh';

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const { accessToken, refreshToken, user } = await authService.login(email, password);
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  return ok(res, { accessToken, user });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  const { accessToken, refreshToken: newRefreshToken, user } = await authService.refreshSession(refreshToken);
  res.cookie(REFRESH_COOKIE, newRefreshToken, refreshCookieOptions);
  return ok(res, { accessToken, user });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  await authService.logout(refreshToken);
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  return ok(res, { loggedOut: true });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id, req.user.role);
  return ok(res, { user });
});
