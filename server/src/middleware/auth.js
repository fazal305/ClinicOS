import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiResponse.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required', 'UNAUTHENTICATED'));
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired token', 'UNAUTHENTICATED'));
  }
}

// Frontend hides/disables UI based on role, but that is UX only — every
// protected write path re-checks the role here, against the token's claim,
// which itself was only issued after a fresh password check at login.
export function requireRole(...roles) {
  return function checkRole(req, res, next) {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required', 'UNAUTHENTICATED'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action', 'FORBIDDEN'));
    }
    return next();
  };
}
