import { z } from 'zod';

export const listCollaboratorsQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  active: z.enum(['true', 'false']).optional(),
  orderBy: z.enum(['name', 'createdAt', 'email']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const createCollaboratorSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const updateCollaboratorSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
});

export const changePasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateCollaboratorInput = z.infer<typeof createCollaboratorSchema>;
export type UpdateCollaboratorInput = z.infer<typeof updateCollaboratorSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ListCollaboratorsQuery = z.infer<typeof listCollaboratorsQuerySchema>;
