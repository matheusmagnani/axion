import { z } from 'zod'

export const createBillingSchema = z.object({
  associateId: z.coerce.number().int().positive('Associado é obrigatório'),
  type: z.enum(['subscription', 'single'], { required_error: 'Tipo é obrigatório' }),
  origin: z.enum(['plan', 'product'], { required_error: 'Origem é obrigatória' }),
  planId: z.coerce.number().int().positive().nullable().optional(),
  productIds: z.array(z.number().int().positive()).optional().default([]),
  discountType: z.enum(['percentage', 'fixed']).nullable().optional(),
  discountValue: z.coerce.number().min(0).nullable().optional(),
  description: z.string().min(1, 'Descrição é obrigatória'),
  dueDate: z.string().min(1, 'Data de vencimento é obrigatória'),
  value: z.coerce.number().min(0, 'Valor é obrigatório'),
  subtotal: z.coerce.number().min(0).nullable().optional(),
})

export const updateBillingSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  description: z.string().min(1).optional(),
  dueDate: z.string().optional(),
})

export const listBillingsQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  type: z.enum(['subscription', 'single']).optional(),
  orderBy: z.enum(['dueDate', 'createdAt', 'value']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const searchAssociateQuerySchema = z.object({
  search: z.string().min(2, 'Busca deve ter pelo menos 2 caracteres'),
})

export type CreateBillingInput = z.infer<typeof createBillingSchema>
export type UpdateBillingInput = z.infer<typeof updateBillingSchema>
export type ListBillingsQuery = z.infer<typeof listBillingsQuerySchema>
