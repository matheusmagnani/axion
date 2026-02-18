import { prisma } from '../../infra/database/prisma/client.js';
import type { ListCollaboratorsQuery, CreateCollaboratorInput, UpdateCollaboratorInput } from './collaborator.schema.js';

const userSelect = {
  id: true,
  name: true,
  email: true,
  active: true,
  roleId: true,
  role: { select: { id: true, name: true } },
  createdAt: true,
  updatedAt: true,
} as const;

export class CollaboratorRepository {
  async findAll(query: ListCollaboratorsQuery, companyId: number) {
    const { page, limit, search, active, orderBy, order } = query;
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      deletedAt: null,
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
        select: userSelect,
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
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  async create(data: CreateCollaboratorInput & { password: string }, companyId: number) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        companyId,
        roleId: data.roleId ?? null,
      },
      select: userSelect,
    });
  }

  async findById(id: number, companyId: number) {
    return prisma.user.findFirst({
      where: { id, companyId, deletedAt: null },
      select: userSelect,
    });
  }

  async update(id: number, data: UpdateCollaboratorInput) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.roleId !== undefined && { roleId: data.roleId }),
      },
      select: userSelect,
    });
  }

  async changePassword(id: number, hashedPassword: string) {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: userSelect,
    });
  }

  async toggleActive(id: number, active: boolean) {
    return prisma.user.update({
      where: { id },
      data: { active },
      select: userSelect,
    });
  }

  async findByEmailIncludeDeleted(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: { not: null } },
    });
  }

  async restore(id: number, data: CreateCollaboratorInput & { password: string }, companyId: number) {
    return prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        companyId,
        roleId: data.roleId ?? null,
        active: true,
        deletedAt: null,
      },
      select: userSelect,
    });
  }

  async softDelete(id: number) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    });
  }
}
