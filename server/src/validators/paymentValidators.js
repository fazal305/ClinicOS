import { z } from 'zod';

const METHODS = ['CASH', 'CARD', 'BANK_TRANSFER', 'OTHER'];
const STATUSES = ['PENDING', 'PAID', 'PARTIAL', 'REFUNDED'];

export const createPaymentSchema = z.object({
  patientId: z.coerce.number().int().positive(),
  appointmentId: z.coerce.number().int().positive().optional(),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  method: z.enum(METHODS),
  status: z.enum(STATUSES).optional().default('PENDING'),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(STATUSES),
});

export const listPaymentsQuerySchema = z.object({
  patientId: z.coerce.number().int().positive().optional(),
  status: z.enum(STATUSES).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const idParamSchema = z.coerce.number().int().positive('Invalid id');
