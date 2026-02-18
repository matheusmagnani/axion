import { RoleRepository } from './role.repository.js'
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js'
import type { CreateRoleInput, UpdateRoleInput, ListRolesQuery } from './role.schema.js'

export class RoleService {
  private repository: RoleRepository

  constructor() {
    this.repository = new RoleRepository()
  }

  async list(query: ListRolesQuery, companyId: number) {
    return this.repository.findAll(query, companyId)
  }

  async getById(id: number, companyId: number) {
    const role = await this.repository.findById(id, companyId)
    if (!role) {
      throw new NotFoundError('Setor')
    }
    return role
  }

  async create(data: CreateRoleInput, companyId: number) {
    const existing = await this.repository.findByName(data.name, companyId)
    if (existing) {
      throw new ConflictError('Já existe um setor com este nome')
    }

    const deleted = await this.repository.findByNameIncludeDeleted(data.name, companyId)
    if (deleted) {
      return this.repository.restore(deleted.id, {
        name: data.name,
        status: data.status ?? 1,
      })
    }

    return this.repository.create(data, companyId)
  }

  async update(id: number, data: UpdateRoleInput, companyId: number) {
    const role = await this.repository.findById(id, companyId)
    if (!role) {
      throw new NotFoundError('Setor')
    }

    if (data.name && data.name !== role.name) {
      const existing = await this.repository.findByName(data.name, companyId)
      if (existing) {
        throw new ConflictError('Já existe um setor com este nome')
      }
    }

    return this.repository.update(id, data)
  }

  async delete(id: number, companyId: number) {
    const role = await this.repository.findById(id, companyId)
    if (!role) {
      throw new NotFoundError('Setor')
    }

    const hasUsers = await this.repository.hasUsers(id)
    if (hasUsers) {
      throw new ConflictError('Não é possível excluir um setor que possui usuários vinculados')
    }

    await this.repository.delete(id, companyId)
  }
}
