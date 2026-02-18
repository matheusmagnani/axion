import { z } from 'zod'

export const MODULES = ['associates', 'billings', 'connections', 'collaborators', 'settings'] as const
export const ACTIONS = ['read', 'create', 'edit', 'delete'] as const

export const roleIdParamSchema = z.object({
  roleId: z.coerce.number().int().positive(),
})

export const updatePermissionsSchema = z.array(
  z.object({
    module: z.enum(MODULES),
    action: z.enum(ACTIONS),
    allowed: z.boolean(),
  })
)

export type UpdatePermissionItem = z.infer<typeof updatePermissionsSchema>[number]
