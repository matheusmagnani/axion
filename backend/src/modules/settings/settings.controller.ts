import { FastifyReply, FastifyRequest } from 'fastify';
import { SettingsService } from './settings.service.js';
import { updateCompanySchema } from './settings.schema.js';

export class SettingsController {
  private service: SettingsService;

  constructor(service: SettingsService) {
    this.service = service;
  }

  async getCompanyInfo(request: FastifyRequest, reply: FastifyReply) {
    const { companyId } = request.user;
    const result = await this.service.getCompanyInfo(companyId);
    return reply.send(result);
  }

  async updateCompanyInfo(request: FastifyRequest, reply: FastifyReply) {
    const { companyId } = request.user;
    const data = updateCompanySchema.parse(request.body);
    const result = await this.service.updateCompanyInfo(companyId, data);
    return reply.send(result);
  }
}
