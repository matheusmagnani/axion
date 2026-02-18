import { FastifyReply, FastifyRequest } from 'fastify'
import { RoleService } from './role.service.js'
import {
  createRoleSchema,
  updateRoleSchema,
  listRolesQuerySchema,
  idParamSchema,
} from './role.schema.js'

const service = new RoleService()

export class RoleController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listRolesQuerySchema.parse(request.query)
    const { companyId } = request.user
    const result = await service.list(query, companyId)
    return reply.send(result)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params)
    const { companyId } = request.user
    const role = await service.getById(id, companyId)
    return reply.send(role)
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createRoleSchema.parse(request.body)
    const { companyId } = request.user
    const role = await service.create(data, companyId)
    return reply.status(201).send(role)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params)
    const data = updateRoleSchema.parse(request.body)
    const { companyId } = request.user
    const role = await service.update(id, data, companyId)
    return reply.send(role)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params)
    const { companyId } = request.user
    await service.delete(id, companyId)
    return reply.status(204).send()
  }
}
