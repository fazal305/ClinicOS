import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(1, 'Department name is required').max(120),
  description: z.string().trim().max(500).optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const idParamSchema = z.coerce.number().int().positive('Invalid id');
