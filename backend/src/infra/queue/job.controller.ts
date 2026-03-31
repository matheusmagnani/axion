import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { prisma } from '../database/prisma/client.js';
import { NotFoundError } from '../../shared/errors/app-error.js';

const jobParamsSchema = z.object({
  queueName: z.string(),
  jobId: z.string(),
});

export class JobController {
  async getStatus(request: FastifyRequest, reply: FastifyReply) {
    const { queueName, jobId } = jobParamsSchema.parse(request.params);
    const { companyId } = request.user;

    const importJob = await prisma.importJob.findFirst({
      where: { jobId, queueName, companyId },
    });

    if (!importJob) {
      throw new NotFoundError('Job');
    }

    return reply.send(importJob);
  }
}
