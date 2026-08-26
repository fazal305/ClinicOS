import { z } from 'zod';

const prescriptionItemSchema = z.object({
  medicineName: z.string().trim().min(1, 'Medicine is required'),
  dosage: z.string().trim().min(1, 'Dosage is required'),
  frequency: z.string().trim().min(1, 'Frequency is required'),
  duration: z.string().trim().min(1, 'Duration is required'),
  instructions: z.string().trim().optional(),
});

export const visitFormSchema = z.object({
  chiefComplaint: z.string().trim().min(1, 'Chief complaint is required').max(500),
  symptoms: z.string().trim().max(2000).optional(),
  diagnosis: z.string().trim().min(1, 'Diagnosis is required').max(500),
  clinicalNotes: z.string().trim().max(4000).optional(),
  treatmentPlan: z.string().trim().max(2000).optional(),
  followUpDate: z.string().optional(),
  prescriptionNotes: z.string().trim().max(1000).optional(),
  items: z.array(prescriptionItemSchema).optional().default([]),
});
