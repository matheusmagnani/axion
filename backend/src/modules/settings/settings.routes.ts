import { FastifyInstance } from 'fastify';
import { SettingsController } from './settings.controller.js';
import { SettingsService } from './settings.service.js';
import { authenticate } from '../../shared/middlewares/auth.js';

export async function settingsRoutes(app: FastifyInstance) {
  const service = new SettingsService();
  const controller = new SettingsController(service);

  app.get('/company', { onRequest: [authenticate] }, controller.getCompanyInfo.bind(controller));
  app.put('/company', { onRequest: [authenticate] }, controller.updateCompanyInfo.bind(controller));
}
