import { prisma } from '../../infra/database/prisma/client.js'
import type { Product } from '@prisma/client'
import type { CreateProductInput, UpdateProductInput, ListProductsQuery } from './product.schema.js'

export class ProductRepository {
  async findAll(query: ListProductsQuery, companyId: number) {
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

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
      }),
      prisma.product.count({ where }),
    ])

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: number, companyId: number): Promise<Product | null> {
    return prisma.product.findFirst({
      where: { id, companyId, deletedAt: null },
    })
  }

  async findByName(name: string, companyId: number): Promise<Product | null> {
    return prisma.product.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        companyId,
        deletedAt: null,
      },
    })
  }

  async findByNameIncludeDeleted(name: string, companyId: number): Promise<Product | null> {
    return prisma.product.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        companyId,
        deletedAt: { not: null },
      },
    })
  }

  async create(data: CreateProductInput, companyId: number): Promise<Product> {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        status: data.status,
        companyId,
      },
    })
  }

  async update(id: number, data: UpdateProductInput & { image?: string | null }): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.image !== undefined && { image: data.image }),
      },
    })
  }

  async restore(id: number, data: { name: string; description?: string; price: number; status: number }): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        status: data.status,
        deletedAt: null,
      },
    })
  }

  async delete(id: number, companyId: number): Promise<void> {
    await prisma.product.updateMany({
      where: { id, companyId },
      data: { deletedAt: new Date(), status: 0 },
    })
  }
}
