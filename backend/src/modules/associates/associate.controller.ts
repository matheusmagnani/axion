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
    const result = await service.list(query);
    return reply.send(result);
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params);
    const associate = await service.getById(id);
    return reply.send(associate);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createAssociateSchema.parse(request.body);
    const associate = await service.create(data);
    return reply.status(201).send(associate);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params);
    const data = updateAssociateSchema.parse(request.body);
    const associate = await service.update(id, data);
    return reply.send(associate);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params);
    await service.delete(id);
    return reply.status(204).send();
  }
}
