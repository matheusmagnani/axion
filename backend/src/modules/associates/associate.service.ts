import { AssociateRepository } from './associate.repository.js';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
import type { CreateAssociateInput, UpdateAssociateInput, ListAssociatesQuery } from './associate.schema.js';

export class AssociateService {
  private repository: AssociateRepository;

  constructor() {
    this.repository = new AssociateRepository();
  }

  async list(query: ListAssociatesQuery) {
    return this.repository.findAll(query);
  }

  async getById(id: number) {
    const associate = await this.repository.findById(id);
    
    if (!associate) {
      throw new NotFoundError('Associate');
    }

    return associate;
  }

  async create(data: CreateAssociateInput) {
    // Check if associate with same CPF already exists
    const existingCpf = await this.repository.findByCpf(data.cpf);
    if (existingCpf) {
      throw new ConflictError('An associate with this CPF already exists');
    }

    // Check if associate with same email already exists
    const existingEmail = await this.repository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError('An associate with this email already exists');
    }

    return this.repository.create(data);
  }

  async update(id: number, data: UpdateAssociateInput) {
    // Check if associate exists
    const associate = await this.repository.findById(id);
    if (!associate) {
      throw new NotFoundError('Associate');
    }

    // If updating CPF, check if another with same CPF exists
    if (data.cpf && data.cpf !== associate.cpf) {
      const existingCpf = await this.repository.findByCpf(data.cpf);
      if (existingCpf) {
        throw new ConflictError('An associate with this CPF already exists');
      }
    }

    // If updating email, check if another with same email exists
    if (data.email && data.email !== associate.email) {
      const existingEmail = await this.repository.findByEmail(data.email);
      if (existingEmail) {
        throw new ConflictError('An associate with this email already exists');
      }
    }

    return this.repository.update(id, data);
  }

  async delete(id: number) {
    // Check if associate exists
    const associate = await this.repository.findById(id);
    if (!associate) {
      throw new NotFoundError('Associate');
    }

    await this.repository.delete(id);
  }
}
