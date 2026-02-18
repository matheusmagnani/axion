import { FastifyInstance } from 'fastify';
import { CollaboratorController } from './collaborator.controller.js';

const controller = new CollaboratorController();

export async function collaboratorRoutes(app: FastifyInstance) {
  app.get('/', controller.list.bind(controller));
  app.post('/', controller.create.bind(controller));
  app.put('/:id', controller.update.bind(controller));
  app.patch('/:id/change-password', controller.changePassword.bind(controller));
  app.patch('/:id/toggle-active', controller.toggleActive.bind(controller));
  app.delete('/:id', controller.delete.bind(controller));
}
