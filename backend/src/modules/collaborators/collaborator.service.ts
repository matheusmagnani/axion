import bcrypt from 'bcryptjs';
import { CollaboratorRepository } from './collaborator.repository.js';
import { NotFoundError, ConflictError } from '../../shared/errors/app-error.js';
import type { ListCollaboratorsQuery, CreateCollaboratorInput, UpdateCollaboratorInput } from './collaborator.schema.js';

export class CollaboratorService {
  private repository: CollaboratorRepository;

  constructor() {
    this.repository = new CollaboratorRepository();
  }

  async list(query: ListCollaboratorsQuery, companyId: number) {
    return this.repository.findAll(query, companyId);
  }

  async create(data: CreateCollaboratorInput, companyId: number) {
    const existing = await this.repository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Já existe um usuário com este email');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.repository.create({ ...data, password: hashedPassword }, companyId);
  }

  async update(id: number, data: UpdateCollaboratorInput, companyId: number) {
    const user = await this.repository.findById(id, companyId);
    if (!user) {
      throw new NotFoundError('Colaborador');
    }
    if (data.email && data.email !== user.email) {
      const existing = await this.repository.findByEmail(data.email);
      if (existing) {
        throw new ConflictError('Já existe um usuário com este email');
      }
    }
    return this.repository.update(id, data);
  }

  async changePassword(id: number, password: string, companyId: number) {
    const user = await this.repository.findById(id, companyId);
    if (!user) {
      throw new NotFoundError('Colaborador');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.repository.changePassword(id, hashedPassword);
  }

  async toggleActive(id: number, companyId: number) {
    const user = await this.repository.findById(id, companyId);
    if (!user) {
      throw new NotFoundError('Colaborador');
    }
    return this.repository.toggleActive(id, !user.active);
  }
}
