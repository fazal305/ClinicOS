import { z } from 'zod';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'];

export const registerPatientSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  dateOfBirth: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid date of birth')
    .refine((value) => new Date(value) <= new Date(), 'Date of birth cannot be in the future'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(30),
  email: z.string().trim().email('Enter a valid email address').optional().or(z.literal('')),
  address: z.string().trim().max(500).optional().or(z.literal('')),
  emergencyContactName: z.string().trim().max(150).optional().or(z.literal('')),
  emergencyContactPhone: z.string().trim().max(30).optional().or(z.literal('')),
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
  allergies: z.string().trim().max(1000).optional().or(z.literal('')),
});

export const updatePatientSchema = registerPatientSchema.partial();

export const patientIdParamSchema = z.coerce.number().int().positive('Invalid patient id');

export const listPatientsQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['name', 'created_at', 'date_of_birth']).optional().default('created_at'),
  sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
});
