import { FastifyInstance } from 'fastify';
import { AssociateController } from './associate.controller.js';

const controller = new AssociateController();

export async function associateRoutes(app: FastifyInstance) {
  // GET /api/associates - List all
  app.get('/', controller.list.bind(controller));

  // GET /api/associates/:id - Get by ID
  app.get('/:id', controller.getById.bind(controller));

  // POST /api/associates - Create new
  app.post('/', controller.create.bind(controller));

  // PUT /api/associates/:id - Update
  app.put('/:id', controller.update.bind(controller));

  // DELETE /api/associates/:id - Delete
  app.delete('/:id', controller.delete.bind(controller));
}
