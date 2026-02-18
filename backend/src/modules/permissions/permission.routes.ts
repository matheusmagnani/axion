import { FastifyInstance } from 'fastify'
import { PermissionController } from './permission.controller.js'

const controller = new PermissionController()

export async function permissionRoutes(app: FastifyInstance) {
  app.get('/:roleId', controller.getByRoleId.bind(controller))
  app.put('/:roleId', controller.updateByRoleId.bind(controller))
}
