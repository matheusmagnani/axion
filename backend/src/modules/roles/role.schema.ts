import { z } from 'zod'

export const createRoleSchema = z.object({
  name: z.string().min(2, 'Nome do setor deve ter pelo menos 2 caracteres'),
  status: z.coerce.number().int().min(0).max(1).optional().default(1),
})

export const updateRoleSchema = z.object({
  name: z.string().min(2, 'Nome do setor deve ter pelo menos 2 caracteres').optional(),
  status: z.coerce.number().int().min(0).max(1).optional(),
})

export const listRolesQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  status: z.coerce.number().int().min(0).max(1).optional(),
  orderBy: z.enum(['name', 'createdAt']).optional().default('name'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
})

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
export type ListRolesQuery = z.infer<typeof listRolesQuerySchema>
