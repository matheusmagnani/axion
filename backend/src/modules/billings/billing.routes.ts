import { FastifyInstance } from 'fastify'
import { BillingController } from './billing.controller.js'

const controller = new BillingController()

export async function billingRoutes(app: FastifyInstance) {
  app.get('/search-associates', controller.searchAssociates.bind(controller))
  app.get('/', controller.list.bind(controller))
  app.get('/:id', controller.getById.bind(controller))
  app.post('/', controller.create.bind(controller))
  app.put('/:id', controller.update.bind(controller))
  app.delete('/:id', controller.delete.bind(controller))
}
