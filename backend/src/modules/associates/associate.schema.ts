import { z } from 'zod';

// Schema for creating associate
export const createAssociateSchema = z.object({
  name: z.string().min(3, 'Name must have at least 3 characters'),
  cpf: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 11, 'CPF must have 11 digits'),
  email: z.string().email('Invalid email'),
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length >= 10 && val.length <= 11, 'Invalid phone'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional().default('PENDING'),
});

// Schema for updating associate
export const updateAssociateSchema = z.object({
  name: z.string().min(3, 'Name must have at least 3 characters').optional(),
  cpf: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 11, 'CPF must have 11 digits')
    .optional(),
  email: z.string().email('Invalid email').optional(),
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length >= 10 && val.length <= 11, 'Invalid phone')
    .optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
});

// Schema for list query params
export const listAssociatesQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
  orderBy: z.enum(['name', 'createdAt', 'status']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Schema for ID params
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Types
export type CreateAssociateInput = z.infer<typeof createAssociateSchema>;
export type UpdateAssociateInput = z.infer<typeof updateAssociateSchema>;
export type ListAssociatesQuery = z.infer<typeof listAssociatesQuerySchema>;
