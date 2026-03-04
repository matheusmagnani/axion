import { FastifyReply, FastifyRequest } from 'fastify'
import { BillingService } from './billing.service.js'
import {
  createBillingSchema,
  updateBillingSchema,
  listBillingsQuerySchema,
  idParamSchema,
  searchAssociateQuerySchema,
} from './billing.schema.js'

const service = new BillingService()

export class BillingController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listBillingsQuerySchema.parse(request.query)
    const { companyId } = request.user
    const result = await service.list(query, companyId)
    return reply.send(result)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params)
    const { companyId } = request.user
    const billing = await service.getById(id, companyId)
    return reply.send(billing)
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createBillingSchema.parse(request.body)
    const { companyId } = request.user
    const billing = await service.create(data, companyId)
    return reply.status(201).send(billing)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params)
    const { companyId } = request.user
    const data = updateBillingSchema.parse(request.body)
    const billing = await service.update(id, data, companyId)
    return reply.send(billing)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params)
    const { companyId } = request.user
    await service.delete(id, companyId)
    return reply.status(204).send()
  }

  async searchAssociates(request: FastifyRequest, reply: FastifyReply) {
    const { search } = searchAssociateQuerySchema.parse(request.query)
    const { companyId } = request.user
    const associates = await service.searchAssociates(search, companyId)
    return reply.send(associates)
  }
}
