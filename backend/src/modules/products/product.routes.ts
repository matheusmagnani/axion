import { FastifyInstance } from 'fastify'
import { ProductController } from './product.controller.js'

const controller = new ProductController()

export async function productRoutes(app: FastifyInstance) {
  app.get('/', controller.list.bind(controller))
  app.get('/:id', controller.getById.bind(controller))
  app.post('/', controller.create.bind(controller))
  app.put('/:id', controller.update.bind(controller))
  app.delete('/:id/image', controller.removeImage.bind(controller))
  app.delete('/:id', controller.delete.bind(controller))
}
