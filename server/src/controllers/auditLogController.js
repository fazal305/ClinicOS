import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { listAuditLogs } from '../repositories/auditLogRepository.js';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(25),
});

export const list = asyncHandler(async (req, res) => {
  const { page, pageSize } = querySchema.parse(req.query);
  const { rows, total } = await listAuditLogs({ page, pageSize });
  return ok(res, rows, { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
});
