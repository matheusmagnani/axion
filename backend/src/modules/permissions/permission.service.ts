import { PermissionRepository } from './permission.repository.js'
import { NotFoundError } from '../../shared/errors/app-error.js'
import { prisma } from '../../infra/database/prisma/client.js'
import type { UpdatePermissionItem } from './permission.schema.js'

export class PermissionService {
  private repository: PermissionRepository

  constructor() {
    this.repository = new PermissionRepository()
  }

  private async validateRoleBelongsToCompany(roleId: number, companyId: number) {
    const role = await prisma.role.findFirst({
      where: { id: roleId, companyId, deletedAt: null },
    })
    if (!role) {
      throw new NotFoundError('Setor')
    }
    return role
  }

  async getByRoleId(roleId: number, companyId: number) {
    await this.validateRoleBelongsToCompany(roleId, companyId)
    return this.repository.findByRoleId(roleId)
  }

  async updateByRoleId(roleId: number, companyId: number, permissions: UpdatePermissionItem[]) {
    await this.validateRoleBelongsToCompany(roleId, companyId)
    return this.repository.upsertMany(roleId, permissions)
  }
}
