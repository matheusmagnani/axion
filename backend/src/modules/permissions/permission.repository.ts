import { prisma } from '../../infra/database/prisma/client.js'
import type { Permission } from '@prisma/client'
import type { UpdatePermissionItem } from './permission.schema.js'

export class PermissionRepository {
  async findByRoleId(roleId: number): Promise<Permission[]> {
    return prisma.permission.findMany({
      where: { roleId },
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    })
  }

  async upsertMany(roleId: number, permissions: UpdatePermissionItem[]): Promise<Permission[]> {
    const results = await prisma.$transaction(
      permissions.map((p) =>
        prisma.permission.upsert({
          where: {
            roleId_module_action: {
              roleId,
              module: p.module,
              action: p.action,
            },
          },
          update: { allowed: p.allowed },
          create: {
            roleId,
            module: p.module,
            action: p.action,
            allowed: p.allowed,
          },
        })
      )
    )
    return results
  }
}
