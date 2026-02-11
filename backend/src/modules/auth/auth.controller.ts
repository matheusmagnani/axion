import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service.js';
import { loginSchema, registerSchema, updateProfileSchema } from './auth.schema.js';
import { ValidationError } from '../../shared/errors/app-error.js';

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

  async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
    const file = await request.file();
    if (!file) throw new ValidationError('Nenhum arquivo enviado');

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new ValidationError('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP');
    }

    const ext = file.filename.split('.').pop()!;
    const buffer = await file.toBuffer();

    if (buffer.length > 5 * 1024 * 1024) {
      throw new ValidationError('Arquivo muito grande.\nTamanho máximo: 5MB');
    }

    const { userId } = request.user;
    const result = await this.service.uploadAvatar(userId, buffer, ext);
    return reply.send(result);
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    const data = updateProfileSchema.parse(request.body);
    const { userId } = request.user;
    const result = await this.service.updateProfile(userId, data);
    return reply.send(result);
  }

  async removeAvatar(request: FastifyRequest, reply: FastifyReply) {
    const { userId } = request.user;
    const result = await this.service.removeAvatar(userId);
    return reply.send(result);
  }
}
