import { AssociateRepository } from './associate.repository.js';
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
import { prisma } from '../../infra/database/prisma/client.js';
import { queueManager } from '../../infra/queue/queue-manager.js';
import type { CreateAssociateInput, UpdateAssociateInput, ListAssociatesQuery, ImportAssociatesInput } from './associate.schema.js';

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

    const deleted = await this.repository.findByCpfIncludeDeleted(data.cpf, companyId);
    if (deleted) {
      return this.repository.restore(deleted.id, data);
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

  async enqueueImport(data: ImportAssociatesInput, companyId: number, userId: number) {
    const QUEUE_NAME = 'associate-import';

    // Create ImportJob record
    const importJob = await prisma.importJob.create({
      data: {
        jobId: '', // will be updated after addJob
        queueName: QUEUE_NAME,
        status: 'PENDING',
        totalRows: data.associates.length,
        companyId,
        userId,
      },
    });

    // Enqueue job
    const jobId = await queueManager.addJob(QUEUE_NAME, {
      associates: data.associates,
      companyId,
      userId,
      importJobId: importJob.id,
    });

    // Update record with BullMQ jobId
    await prisma.importJob.update({
      where: { id: importJob.id },
      data: { jobId },
    });

    return { jobId, importJobId: importJob.id };
  }
}
