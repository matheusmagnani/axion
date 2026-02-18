import { FastifyInstance } from 'fastify'
import { RoleController } from './role.controller.js'

const controller = new RoleController()

export async function roleRoutes(app: FastifyInstance) {
  app.get('/', controller.list.bind(controller))
  app.get('/:id', controller.getById.bind(controller))
  app.post('/', controller.create.bind(controller))
  app.put('/:id', controller.update.bind(controller))
  app.delete('/:id', controller.delete.bind(controller))
}
