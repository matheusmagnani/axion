import { FastifyReply, FastifyRequest } from 'fastify';
import { AssociateService } from './associate.service.js';
import {
  createAssociateSchema,
  updateAssociateSchema,
  listAssociatesQuerySchema,
  idParamSchema,
} from './associate.schema.js';

const service = new AssociateService();

export class AssociateController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listAssociatesQuerySchema.parse(request.query);
    const { companyId } = request.user;
    const result = await service.list(query, companyId);
    return reply.send(result);
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params);
    const { companyId } = request.user;
    const associate = await service.getById(id, companyId);
    return reply.send(associate);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createAssociateSchema.parse(request.body);
    const { companyId } = request.user;
    const associate = await service.create(data, companyId);
    return reply.status(201).send(associate);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params);
    const data = updateAssociateSchema.parse(request.body);
    const { companyId } = request.user;
    const associate = await service.update(id, data, companyId);
    return reply.send(associate);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params);
    const { companyId } = request.user;
    await service.delete(id, companyId);
    return reply.status(204).send();
  }
}
