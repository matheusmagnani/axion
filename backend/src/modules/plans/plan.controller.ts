import { FastifyReply, FastifyRequest } from 'fastify'
import { PlanService } from './plan.service.js'
import {
  createPlanSchema,
  updatePlanSchema,
  listPlansQuerySchema,
  idParamSchema,
} from './plan.schema.js'

const service = new PlanService()

export class PlanController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listPlansQuerySchema.parse(request.query)
    const { companyId } = request.user
    const result = await service.list(query, companyId)
    return reply.send(result)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params)
    const { companyId } = request.user
    const plan = await service.getById(id, companyId)
    return reply.send(plan)
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createPlanSchema.parse(request.body)
    const { companyId } = request.user
    const plan = await service.create(data, companyId)
    return reply.status(201).send(plan)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params)
    const { companyId } = request.user
    const data = updatePlanSchema.parse(request.body)
    const plan = await service.update(id, data, companyId)
    return reply.send(plan)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params)
    const { companyId } = request.user
    await service.delete(id, companyId)
    return reply.status(204).send()
  }
}
