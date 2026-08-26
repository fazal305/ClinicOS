import { z } from 'zod';

const APPOINTMENT_TYPES = ['NEW_VISIT', 'FOLLOW_UP', 'CONSULTATION', 'PROCEDURE'];
export const APPOINTMENT_STATUSES = [
  'SCHEDULED',
  'CONFIRMED',
  'WAITING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

export const createAppointmentSchema = z.object({
  patientId: z.coerce.number().int().positive(),
  doctorId: z.coerce.number().int().positive(),
  departmentId: z.coerce.number().int().positive().optional(),
  scheduledAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid date and time'),
  durationMinutes: z.coerce.number().int().min(5).max(240).optional().default(30),
  type: z.enum(APPOINTMENT_TYPES).optional().default('NEW_VISIT'),
  reason: z.string().trim().max(500).optional(),
});

export const rescheduleAppointmentSchema = z.object({
  doctorId: z.coerce.number().int().positive().optional(),
  departmentId: z.coerce.number().int().positive().optional(),
  scheduledAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid date and time')
    .optional(),
  durationMinutes: z.coerce.number().int().min(5).max(240).optional(),
  type: z.enum(APPOINTMENT_TYPES).optional(),
  reason: z.string().trim().max(500).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(APPOINTMENT_STATUSES),
});

export const idParamSchema = z.coerce.number().int().positive('Invalid id');

export const listAppointmentsQuerySchema = z.object({
  date: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date')
    .optional(),
  from: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date')
    .optional(),
  to: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date')
    .optional(),
  doctorId: z.coerce.number().int().positive().optional(),
  patientId: z.coerce.number().int().positive().optional(),
  departmentId: z.coerce.number().int().positive().optional(),
  status: z.enum(APPOINTMENT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});
