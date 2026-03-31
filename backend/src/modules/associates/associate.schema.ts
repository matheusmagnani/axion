import { z } from 'zod';

// Schema for creating associate
export const createAssociateSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 11, 'CPF deve ter 11 dígitos'),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length >= 10 && val.length <= 11, 'Telefone inválido'),
  status: z.coerce.number().int().min(0).max(2).optional().default(2),
});

// Schema for updating associate
export const updateAssociateSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  cpf: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 11, 'CPF deve ter 11 dígitos')
    .optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length >= 10 && val.length <= 11, 'Telefone inválido')
    .optional(),
  status: z.coerce.number().int().min(0).max(2).optional(),
});

// Schema for list query params
export const listAssociatesQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  status: z.coerce.number().int().min(0).max(2).optional(),
  orderBy: z.enum(['name', 'createdAt', 'status']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Schema for ID params
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Schema for bulk import
const importAssociateItemSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
});

export const importAssociatesSchema = z.object({
  associates: z
    .array(importAssociateItemSchema)
    .min(1, 'A planilha deve conter pelo menos 1 associado')
    .max(5000, 'Máximo de 5000 associados por importação'),
});

// Types
export type CreateAssociateInput = z.infer<typeof createAssociateSchema>;
export type UpdateAssociateInput = z.infer<typeof updateAssociateSchema>;
export type ListAssociatesQuery = z.infer<typeof listAssociatesQuerySchema>;
export type ImportAssociatesInput = z.infer<typeof importAssociatesSchema>;
