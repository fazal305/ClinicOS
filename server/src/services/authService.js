import { ApiError } from '../utils/apiResponse.js';
import { verifyPassword } from '../utils/password.js';
import { signAccessToken, generateRefreshToken, hashRefreshToken, refreshTtlToDate } from '../utils/jwt.js';
import { findUserByEmail, findUserById, getProfileForUser } from '../repositories/userRepository.js';
import {
  storeRefreshToken,
  findActiveRefreshToken,
  revokeRefreshToken,
} from '../repositories/refreshTokenRepository.js';
import { recordAuditLog } from '../repositories/auditLogRepository.js';

async function issueTokens(user) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(user.id, hashRefreshToken(refreshToken), refreshTtlToDate());
  return { accessToken, refreshToken };
}

export async function login(email, password) {
  const user = await findUserByEmail(email);
  if (!user || !user.is_active) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const passwordMatches = await verifyPassword(password, user.password_hash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const tokens = await issueTokens(user);
  const profile = await getProfileForUser(user.id, user.role);
  await recordAuditLog({ userId: user.id, action: 'LOGIN', entityType: 'user', entityId: user.id });

  return {
    ...tokens,
    user: { id: user.id, email: user.email, role: user.role, profile },
  };
}

export async function refreshSession(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, 'No refresh token provided', 'UNAUTHENTICATED');
  }
  const tokenHash = hashRefreshToken(refreshToken);
  const stored = await findActiveRefreshToken(tokenHash);
  if (!stored) {
    throw new ApiError(401, 'Session expired, please log in again', 'UNAUTHENTICATED');
  }

  const user = await findUserById(stored.user_id);
  if (!user || !user.is_active) {
    throw new ApiError(401, 'Session expired, please log in again', 'UNAUTHENTICATED');
  }

  // Rotate: revoke the old refresh token and issue a new pair.
  await revokeRefreshToken(tokenHash);
  const tokens = await issueTokens(user);
  const profile = await getProfileForUser(user.id, user.role);

  return {
    ...tokens,
    user: { id: user.id, email: user.email, role: user.role, profile },
  };
}

export async function logout(refreshToken) {
  if (refreshToken) {
    await revokeRefreshToken(hashRefreshToken(refreshToken));
  }
}

export async function getCurrentUser(userId, role) {
  const user = await findUserById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found', 'NOT_FOUND');
  }
  const profile = await getProfileForUser(userId, role);
  return { id: user.id, email: user.email, role: user.role, profile };
}
