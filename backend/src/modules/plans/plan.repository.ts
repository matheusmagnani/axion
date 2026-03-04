import { prisma } from '../../infra/database/prisma/client.js'
import type { Plan } from '@prisma/client'
import type { CreatePlanInput, UpdatePlanInput, ListPlansQuery } from './plan.schema.js'

export class PlanRepository {
  async findAll(query: ListPlansQuery, companyId: number) {
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

    const [plans, total] = await Promise.all([
      prisma.plan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
      }),
      prisma.plan.count({ where }),
    ])

    return {
      data: plans,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: number, companyId: number): Promise<Plan | null> {
    return prisma.plan.findFirst({
      where: { id, companyId, deletedAt: null },
    })
  }

  async findByName(name: string, companyId: number): Promise<Plan | null> {
    return prisma.plan.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        companyId,
        deletedAt: null,
      },
    })
  }

  async findByNameIncludeDeleted(name: string, companyId: number): Promise<Plan | null> {
    return prisma.plan.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        companyId,
        deletedAt: { not: null },
      },
    })
  }

  async create(data: CreatePlanInput, companyId: number): Promise<Plan> {
    return prisma.plan.create({
      data: {
        name: data.name,
        description: data.description,
        productIds: data.productIds,
        discountType: data.discountType ?? null,
        discountValue: data.discountValue ?? null,
        companyId,
      },
    })
  }

  async update(id: number, data: UpdatePlanInput): Promise<Plan> {
    return prisma.plan.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.productIds !== undefined && { productIds: data.productIds }),
        ...(data.discountType !== undefined && { discountType: data.discountType }),
        ...(data.discountValue !== undefined && { discountValue: data.discountValue }),
        ...(data.status !== undefined && { status: data.status }),
      },
    })
  }

  async restore(id: number, data: CreatePlanInput & { status: number }): Promise<Plan> {
    return prisma.plan.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        productIds: data.productIds,
        discountType: data.discountType ?? null,
        discountValue: data.discountValue ?? null,
        status: data.status,
        deletedAt: null,
      },
    })
  }

  async delete(id: number, companyId: number): Promise<void> {
    await prisma.plan.updateMany({
      where: { id, companyId },
      data: { deletedAt: new Date(), status: 0 },
    })
  }

  async removeProductFromAll(productId: number, companyId: number): Promise<void> {
    const plans = await prisma.plan.findMany({
      where: {
        companyId,
        deletedAt: null,
        productIds: { has: productId },
      },
    })

    await Promise.all(
      plans.map((plan) =>
        prisma.plan.update({
          where: { id: plan.id },
          data: {
            productIds: plan.productIds.filter((id) => id !== productId),
          },
        })
      )
    )
  }
}
