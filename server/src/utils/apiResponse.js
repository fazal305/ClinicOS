export function ok(res, data, meta) {
  return res.json({ success: true, data, error: null, meta: meta ?? null });
}

export function created(res, data, meta) {
  return res.status(201).json({ success: true, data, error: null, meta: meta ?? null });
}

export function noContent(res) {
  return res.status(204).send();
}

export class ApiError extends Error {
  constructor(statusCode, message, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'ERROR';
  }
}
