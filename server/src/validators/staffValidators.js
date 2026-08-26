import { z } from 'zod';

export const createDoctorSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  initialPassword: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  specialization: z.string().trim().min(1, 'Specialization is required').max(150),
  departmentId: z.coerce.number().int().positive().optional(),
  phone: z.string().trim().max(30).optional(),
});

export const updateDoctorSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  specialization: z.string().trim().min(1).max(150).optional(),
  departmentId: z.coerce.number().int().positive().optional(),
  phone: z.string().trim().max(30).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const createReceptionistSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  initialPassword: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  phone: z.string().trim().max(30).optional(),
});

export const updateReceptionistSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const idParamSchema = z.coerce.number().int().positive('Invalid id');
