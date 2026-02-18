import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(2, 'Nome do produto deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Valor deve ser maior ou igual a zero'),
  status: z.coerce.number().int().min(0).max(1).optional().default(1),
})

export const updateProductSchema = z.object({
  name: z.string().min(2, 'Nome do produto deve ter pelo menos 2 caracteres').optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Valor deve ser maior ou igual a zero').optional(),
  status: z.coerce.number().int().min(0).max(1).optional(),
})

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  status: z.coerce.number().int().min(0).max(1).optional(),
  orderBy: z.enum(['name', 'price', 'createdAt']).optional().default('name'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
})

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>
