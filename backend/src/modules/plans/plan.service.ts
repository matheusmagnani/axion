import { PlanRepository } from './plan.repository.js'
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js'
import type { CreatePlanInput, UpdatePlanInput, ListPlansQuery } from './plan.schema.js'

export class PlanService {
  private repository: PlanRepository

  constructor() {
    this.repository = new PlanRepository()
  }

  async list(query: ListPlansQuery, companyId: number) {
    return this.repository.findAll(query, companyId)
  }

  async getById(id: number, companyId: number) {
    const plan = await this.repository.findById(id, companyId)
    if (!plan) {
      throw new NotFoundError('Plano')
    }
    return plan
  }

  async create(data: CreatePlanInput, companyId: number) {
    const existing = await this.repository.findByName(data.name, companyId)
    if (existing) {
      throw new ConflictError('Já existe um plano com este nome')
    }

    const deleted = await this.repository.findByNameIncludeDeleted(data.name, companyId)
    if (deleted) {
      return this.repository.restore(deleted.id, {
        ...data,
        status: 1,
      })
    }

    return this.repository.create(data, companyId)
  }

  async update(id: number, data: UpdatePlanInput, companyId: number) {
    const plan = await this.repository.findById(id, companyId)
    if (!plan) {
      throw new NotFoundError('Plano')
    }

    if (data.name && data.name !== plan.name) {
      const existing = await this.repository.findByName(data.name, companyId)
      if (existing) {
        throw new ConflictError('Já existe um plano com este nome')
      }
    }

    return this.repository.update(id, data)
  }

  async delete(id: number, companyId: number) {
    const plan = await this.repository.findById(id, companyId)
    if (!plan) {
      throw new NotFoundError('Plano')
    }

    await this.repository.delete(id, companyId)
  }
}
