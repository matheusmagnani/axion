import { AssociateRepository } from './associate.repository.js';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
import type { CreateAssociateInput, UpdateAssociateInput, ListAssociatesQuery } from './associate.schema.js';

export class AssociateService {
  private repository: AssociateRepository;

  constructor() {
    this.repository = new AssociateRepository();
  }

  async list(query: ListAssociatesQuery, companyId: number) {
    return this.repository.findAll(query, companyId);
  }

  async getById(id: number, companyId: number) {
    const associate = await this.repository.findById(id, companyId);

    if (!associate) {
      throw new NotFoundError('Associado');
    }

    return associate;
  }

  async create(data: CreateAssociateInput, companyId: number) {
    const existingCpf = await this.repository.findByCpf(data.cpf, companyId);
    if (existingCpf) {
      throw new ConflictError('Já existe um associado com este CPF');
    }

    return this.repository.create(data, companyId);
  }

  async update(id: number, data: UpdateAssociateInput, companyId: number) {
    const associate = await this.repository.findById(id, companyId);
    if (!associate) {
      throw new NotFoundError('Associado');
    }

    if (data.cpf && data.cpf !== associate.cpf) {
      const existingCpf = await this.repository.findByCpf(data.cpf, companyId);
      if (existingCpf) {
        throw new ConflictError('Já existe um associado com este CPF');
      }
    }

    return this.repository.update(id, data, companyId);
  }

  async delete(id: number, companyId: number) {
    const associate = await this.repository.findById(id, companyId);
    if (!associate) {
      throw new NotFoundError('Associado');
    }

    await this.repository.delete(id, companyId);
  }
}
