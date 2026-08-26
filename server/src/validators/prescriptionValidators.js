import { z } from 'zod';

const prescriptionItemSchema = z.object({
  medicineName: z.string().trim().min(1, 'Medicine name is required').max(200),
  dosage: z.string().trim().min(1, 'Dosage is required').max(100),
  frequency: z.string().trim().min(1, 'Frequency is required').max(100),
  duration: z.string().trim().min(1, 'Duration is required').max(100),
  instructions: z.string().trim().max(500).optional(),
});

export const createPrescriptionSchema = z.object({
  patientId: z.coerce.number().int().positive(),
  medicalRecordId: z.coerce.number().int().positive().optional(),
  prescribedDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid date'),
  notes: z.string().trim().max(1000).optional(),
  items: z.array(prescriptionItemSchema).min(1, 'Add at least one medicine'),
});

export const listPrescriptionsQuerySchema = z.object({
  patientId: z.coerce.number().int().positive(),
});

export const idParamSchema = z.coerce.number().int().positive('Invalid id');
