import { prisma } from '../../infra/database/prisma/client.js'
import type { Billing } from '@prisma/client'
import type { CreateBillingInput, UpdateBillingInput, ListBillingsQuery } from './billing.schema.js'

export class BillingRepository {
  async findAll(query: ListBillingsQuery, companyId: number) {
    const { page, limit, search, status, type, orderBy, order } = query
    const skip = (page - 1) * limit

    const where = {
      companyId,
      deletedAt: null,
      ...(status && { status }),
      ...(type && { type }),
      ...(search && {
        associate: {
          name: { contains: search, mode: 'insensitive' as const },
        },
      }),
    }

    const [billings, total] = await Promise.all([
      prisma.billing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
        include: {
          associate: {
            select: { id: true, name: true, cpf: true },
          },
        },
      }),
      prisma.billing.count({ where }),
    ])

    return {
      data: billings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: number, companyId: number) {
    return prisma.billing.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        associate: {
          select: { id: true, name: true, cpf: true },
        },
      },
    })
  }

  async create(data: CreateBillingInput, companyId: number): Promise<Billing> {
    return prisma.billing.create({
      data: {
        description: data.description,
        value: data.value,
        subtotal: data.subtotal ?? null,
        dueDate: new Date(data.dueDate),
        type: data.type,
        origin: data.origin,
        planId: data.planId ?? null,
        productIds: data.productIds ?? [],
        discountType: data.discountType ?? null,
        discountValue: data.discountValue ?? null,
        associateId: data.associateId,
        companyId,
      },
    })
  }

  async update(id: number, data: UpdateBillingInput): Promise<Billing> {
    return prisma.billing.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.dueDate !== undefined && { dueDate: new Date(data.dueDate) }),
      },
    })
  }

  async delete(id: number, companyId: number): Promise<void> {
    await prisma.billing.updateMany({
      where: { id, companyId },
      data: { deletedAt: new Date(), status: 'CANCELLED' },
    })
  }

  async searchAssociates(search: string, companyId: number) {
    return prisma.associate.findMany({
      where: {
        companyId,
        deletedAt: null,
        status: { not: 0 },
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { cpf: { contains: search } },
        ],
      },
      select: {
        id: true,
        name: true,
        cpf: true,
      },
      take: 10,
      orderBy: { name: 'asc' },
    })
  }
}
