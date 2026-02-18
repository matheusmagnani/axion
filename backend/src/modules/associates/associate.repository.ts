import { prisma } from '../../infra/database/prisma/client.js';
import type { CreateAssociateInput, UpdateAssociateInput, ListAssociatesQuery } from './associate.schema.js';

export class AssociateRepository {
  async findAll(query: ListAssociatesQuery, companyId: number) {
    const { page, limit, search, status, orderBy, order } = query;
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { cpf: { contains: search } },
        ],
      }),
      ...(status !== undefined && { status }),
    };

    const [associates, total] = await Promise.all([
      prisma.associate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
      }),
      prisma.associate.count({ where }),
    ]);

    return {
      data: associates,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number, companyId: number) {
    return prisma.associate.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        contracts: true,
        billings: true,
      },
    });
  }

  async findByCpf(cpf: string, companyId: number) {
    return prisma.associate.findFirst({
      where: { cpf, companyId, deletedAt: null },
    });
  }

  async findByEmail(email: string, companyId: number) {
    return prisma.associate.findFirst({
      where: { email, companyId, deletedAt: null },
    });
  }

  async create(data: CreateAssociateInput, companyId: number) {
    return prisma.associate.create({
      data: {
        name: data.name,
        cpf: data.cpf,
        email: data.email,
        phone: data.phone,
        status: data.status,
        companyId,
      },
    });
  }

  async update(id: number, data: UpdateAssociateInput, companyId: number) {
    return prisma.associate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.cpf && { cpf: data.cpf }),
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });
  }

  async findByCpfIncludeDeleted(cpf: string, companyId: number) {
    return prisma.associate.findFirst({
      where: { cpf, companyId, deletedAt: { not: null } },
    });
  }

  async restore(id: number, data: CreateAssociateInput) {
    return prisma.associate.update({
      where: { id },
      data: {
        name: data.name,
        cpf: data.cpf,
        email: data.email,
        phone: data.phone,
        status: data.status ?? 2,
        deletedAt: null,
      },
    });
  }

  async delete(id: number, companyId: number): Promise<void> {
    await prisma.associate.updateMany({
      where: { id, companyId },
      data: { deletedAt: new Date(), status: 0 },
    });
  }
}
