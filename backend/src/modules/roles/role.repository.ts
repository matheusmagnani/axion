import { prisma } from '../../infra/database/prisma/client.js'
import type { Role } from '@prisma/client'
import type { CreateRoleInput, UpdateRoleInput, ListRolesQuery } from './role.schema.js'

export class RoleRepository {
  async findAll(query: ListRolesQuery, companyId: number) {
    const { page, limit, search, status, orderBy, order } = query
    const skip = (page - 1) * limit

    const where = {
      companyId,
      deletedAt: null,
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
      ...(status !== undefined && { status }),
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
        include: {
          _count: {
            select: {
              users: { where: { deletedAt: null } },
            },
          },
        },
      }),
      prisma.role.count({ where }),
    ])

    return {
      data: roles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: number, companyId: number): Promise<Role | null> {
    return prisma.role.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        _count: {
          select: {
            users: { where: { deletedAt: null } },
          },
        },
      },
    })
  }

  async findByName(name: string, companyId: number): Promise<Role | null> {
    return prisma.role.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        companyId,
        deletedAt: null,
      },
    })
  }

  async create(data: CreateRoleInput, companyId: number): Promise<Role> {
    return prisma.role.create({
      data: {
        name: data.name,
        status: data.status,
        companyId,
      },
    })
  }

  async update(id: number, data: UpdateRoleInput): Promise<Role> {
    return prisma.role.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.status !== undefined && { status: data.status }),
      },
    })
  }

  async findByNameIncludeDeleted(name: string, companyId: number): Promise<Role | null> {
    return prisma.role.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        companyId,
        deletedAt: { not: null },
      },
    })
  }

  async restore(id: number, data: { name: string; status: number }): Promise<Role> {
    return prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        status: data.status,
        deletedAt: null,
      },
    })
  }

  async delete(id: number, companyId: number): Promise<void> {
    await prisma.role.updateMany({
      where: { id, companyId },
      data: { deletedAt: new Date(), status: 0 },
    })
  }

  async hasUsers(id: number): Promise<boolean> {
    const count = await prisma.user.count({
      where: { roleId: id, deletedAt: null },
    })
    return count > 0
  }
}
