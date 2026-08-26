import { ApiError } from '../utils/apiResponse.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Route not found' } });
}

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      error: { code: err.code, message: err.message },
    });
  }

  if (err?.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.issues?.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
      },
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    data: null,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
}
