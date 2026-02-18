import { FastifyReply, FastifyRequest } from 'fastify'
import { PermissionService } from './permission.service.js'
import { roleIdParamSchema, updatePermissionsSchema } from './permission.schema.js'

const service = new PermissionService()

export class PermissionController {
  async getByRoleId(request: FastifyRequest, reply: FastifyReply) {
    const { roleId } = roleIdParamSchema.parse(request.params)
    const { companyId } = request.user
    const permissions = await service.getByRoleId(roleId, companyId)
    return reply.send(permissions)
  }

  async updateByRoleId(request: FastifyRequest, reply: FastifyReply) {
    const { roleId } = roleIdParamSchema.parse(request.params)
    const permissions = updatePermissionsSchema.parse(request.body)
    const { companyId } = request.user
    const result = await service.updateByRoleId(roleId, companyId, permissions)
    return reply.send(result)
  }
}
