import { FastifyReply, FastifyRequest } from 'fastify';
import { CollaboratorService } from './collaborator.service.js';
import { listCollaboratorsQuerySchema, createCollaboratorSchema, updateCollaboratorSchema, changePasswordSchema, idParamSchema } from './collaborator.schema.js';

const service = new CollaboratorService();

export class CollaboratorController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listCollaboratorsQuerySchema.parse(request.query);
    const { companyId } = request.user;
    const result = await service.list(query, companyId);
    return reply.send(result);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createCollaboratorSchema.parse(request.body);
    const { companyId } = request.user;
    const result = await service.create(data, companyId);
    return reply.status(201).send(result);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params);
    const data = updateCollaboratorSchema.parse(request.body);
    const { companyId } = request.user;
    const result = await service.update(id, data, companyId);
    return reply.send(result);
  }

  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params);
    const { password } = changePasswordSchema.parse(request.body);
    const { companyId } = request.user;
    const result = await service.changePassword(id, password, companyId);
    return reply.send(result);
  }

  async toggleActive(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params);
    const { companyId } = request.user;
    const result = await service.toggleActive(id, companyId);
    return reply.send(result);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params);
    const { companyId } = request.user;
    const result = await service.delete(id, companyId);
    return reply.send(result);
  }
}
