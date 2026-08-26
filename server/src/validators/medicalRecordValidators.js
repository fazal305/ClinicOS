import { z } from 'zod';

export const createMedicalRecordSchema = z.object({
  patientId: z.coerce.number().int().positive(),
  appointmentId: z.coerce.number().int().positive().optional(),
  visitDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid visit date'),
  chiefComplaint: z.string().trim().min(1, 'Chief complaint is required').max(500),
  symptoms: z.string().trim().max(2000).optional(),
  diagnosis: z.string().trim().min(1, 'Diagnosis is required').max(500),
  clinicalNotes: z.string().trim().max(4000).optional(),
  treatmentPlan: z.string().trim().max(2000).optional(),
  followUpDate: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid follow-up date')
    .optional()
    .or(z.literal('')),
});

export const listMedicalRecordsQuerySchema = z.object({
  patientId: z.coerce.number().int().positive(),
});

export const idParamSchema = z.coerce.number().int().positive('Invalid id');
