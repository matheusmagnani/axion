import { prisma } from '../../infra/database/prisma/client.js';
import type { CreateAssociateInput, UpdateAssociateInput, ListAssociatesQuery } from './associate.schema.js';
import type { Associate, AssociateStatus } from '@prisma/client';

export class AssociateRepository {
  async findAll(query: ListAssociatesQuery, companyId: number) {
    const { page, limit, search, status, orderBy, order } = query;
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { cpf: { contains: search } },
        ],
      }),
      ...(status && { status: status as AssociateStatus }),
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

  async findById(id: number, companyId: number): Promise<Associate | null> {
    return prisma.associate.findFirst({
      where: { id, companyId },
      include: {
        contracts: true,
        billings: true,
      },
    });
  }

  async findByCpf(cpf: string, companyId: number): Promise<Associate | null> {
    return prisma.associate.findFirst({
      where: { cpf, companyId },
    });
  }

  async findByEmail(email: string, companyId: number): Promise<Associate | null> {
    return prisma.associate.findFirst({
      where: { email, companyId },
    });
  }

  async create(data: CreateAssociateInput, companyId: number): Promise<Associate> {
    return prisma.associate.create({
      data: {
        name: data.name,
        cpf: data.cpf,
        email: data.email,
        phone: data.phone,
        status: data.status as AssociateStatus,
        companyId,
      },
    });
  }

  async update(id: number, data: UpdateAssociateInput, companyId: number): Promise<Associate> {
    return prisma.associate.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.cpf && { cpf: data.cpf }),
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.status && { status: data.status as AssociateStatus }),
      },
    });
  }

  async delete(id: number, companyId: number): Promise<void> {
    await prisma.associate.deleteMany({
      where: { id, companyId },
    });
  }
}
