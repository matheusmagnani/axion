import { z } from 'zod'

export const createPlanSchema = z.object({
  name: z.string().min(2, 'Nome do plano deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  productIds: z.array(z.number().int().positive()).min(1, 'Selecione pelo menos um produto'),
  discountType: z.enum(['percentage', 'fixed']).nullable().optional(),
  discountValue: z.coerce.number().min(0).nullable().optional(),
})

export const updatePlanSchema = z.object({
  name: z.string().min(2, 'Nome do plano deve ter pelo menos 2 caracteres').optional(),
  description: z.string().optional(),
  productIds: z.array(z.number().int().positive()).min(1, 'Selecione pelo menos um produto').optional(),
  discountType: z.enum(['percentage', 'fixed']).nullable().optional(),
  discountValue: z.coerce.number().min(0).nullable().optional(),
  status: z.coerce.number().int().min(0).max(1).optional(),
})

export const listPlansQuerySchema = z.object({
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

export type CreatePlanInput = z.infer<typeof createPlanSchema>
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>
export type ListPlansQuery = z.infer<typeof listPlansQuerySchema>
