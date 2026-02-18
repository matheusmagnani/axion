import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { authenticate } from '../../shared/middlewares/auth.js';

export async function authRoutes(app: FastifyInstance) {
  const service = new AuthService(app);
  const controller = new AuthController(service);

  app.post('/login', controller.login.bind(controller));
  app.post('/register', controller.register.bind(controller));
  app.post('/refresh', { onRequest: [authenticate] }, controller.refresh.bind(controller));
  app.patch('/avatar', { onRequest: [authenticate] }, controller.uploadAvatar.bind(controller));
  app.delete('/avatar', { onRequest: [authenticate] }, controller.removeAvatar.bind(controller));
  app.patch('/profile', { onRequest: [authenticate] }, controller.updateProfile.bind(controller));
  app.patch('/change-password', { onRequest: [authenticate] }, controller.changePassword.bind(controller));
}
