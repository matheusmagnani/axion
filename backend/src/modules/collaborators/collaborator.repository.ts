import { prisma } from '../../infra/database/prisma/client.js';
import type { ListCollaboratorsQuery, CreateCollaboratorInput, UpdateCollaboratorInput } from './collaborator.schema.js';

export class CollaboratorRepository {
  async findAll(query: ListCollaboratorsQuery, companyId: number) {
    const { page, limit, search, active, orderBy, order } = query;
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(active !== undefined && { active: active === 'true' }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
        select: {
          id: true,
          name: true,
          email: true,
          active: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateCollaboratorInput & { password: string }, companyId: number) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        companyId,
      },
      select: { id: true, name: true, email: true, active: true, createdAt: true, updatedAt: true },
    });
  }

  async findById(id: number, companyId: number) {
    return prisma.user.findFirst({
      where: { id, companyId },
      select: { id: true, name: true, email: true, active: true, createdAt: true, updatedAt: true },
    });
  }

  async update(id: number, data: UpdateCollaboratorInput) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
      },
      select: { id: true, name: true, email: true, active: true, createdAt: true, updatedAt: true },
    });
  }

  async changePassword(id: number, hashedPassword: string) {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: { id: true, name: true, email: true, active: true, createdAt: true, updatedAt: true },
    });
  }

  async toggleActive(id: number, active: boolean) {
    return prisma.user.update({
      where: { id },
      data: { active },
      select: { id: true, name: true, email: true, active: true, createdAt: true, updatedAt: true },
    });
  }
}
