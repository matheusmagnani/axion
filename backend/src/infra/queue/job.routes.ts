import { FastifyInstance } from 'fastify';
import { JobController } from './job.controller.js';

const controller = new JobController();

export async function jobRoutes(app: FastifyInstance) {
  app.get('/:queueName/:jobId', controller.getStatus.bind(controller));
}
