import { FastifyInstance } from 'fastify'
import { PlanController } from './plan.controller.js'

const controller = new PlanController()

export async function planRoutes(app: FastifyInstance) {
  app.get('/', controller.list.bind(controller))
  app.get('/:id', controller.getById.bind(controller))
  app.post('/', controller.create.bind(controller))
  app.put('/:id', controller.update.bind(controller))
  app.delete('/:id', controller.delete.bind(controller))
}
