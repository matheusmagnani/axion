import { BillingRepository } from './billing.repository.js'
import { NotFoundError } from '../../shared/errors/app-error.js'
import type { CreateBillingInput, UpdateBillingInput, ListBillingsQuery } from './billing.schema.js'

export class BillingService {
  private repository: BillingRepository

  constructor() {
    this.repository = new BillingRepository()
  }

  async list(query: ListBillingsQuery, companyId: number) {
    return this.repository.findAll(query, companyId)
  }

  async getById(id: number, companyId: number) {
    const billing = await this.repository.findById(id, companyId)
    if (!billing) {
      throw new NotFoundError('Cobrança')
    }
    return billing
  }

  async create(data: CreateBillingInput, companyId: number) {
    return this.repository.create(data, companyId)
  }

  async update(id: number, data: UpdateBillingInput, companyId: number) {
    const billing = await this.repository.findById(id, companyId)
    if (!billing) {
      throw new NotFoundError('Cobrança')
    }
    return this.repository.update(id, data)
  }

  async delete(id: number, companyId: number) {
    const billing = await this.repository.findById(id, companyId)
    if (!billing) {
      throw new NotFoundError('Cobrança')
    }
    await this.repository.delete(id, companyId)
  }

  async searchAssociates(search: string, companyId: number) {
    return this.repository.searchAssociates(search, companyId)
  }
}
