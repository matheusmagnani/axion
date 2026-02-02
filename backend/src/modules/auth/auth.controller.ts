import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service.js';
import { loginSchema, registerSchema } from './auth.schema.js';

export class AuthController {
  private service: AuthService;

  constructor(service: AuthService) {
    this.service = service;
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const data = loginSchema.parse(request.body);
    const result = await this.service.login(data);
    return reply.send(result);
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    const data = registerSchema.parse(request.body);
    const result = await this.service.register(data);
    return reply.status(201).send(result);
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const { userId, companyId } = request.user;
    const result = await this.service.refresh(userId, companyId);
    return reply.send(result);
  }
}
