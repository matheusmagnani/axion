import fs from 'node:fs'
import path from 'node:path'
import { ProductRepository } from './product.repository.js'
import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js'
import type { CreateProductInput, UpdateProductInput, ListProductsQuery } from './product.schema.js'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

export class ProductService {
  private repository: ProductRepository

  constructor() {
    this.repository = new ProductRepository()
  }

  async list(query: ListProductsQuery, companyId: number) {
    return this.repository.findAll(query, companyId)
  }

  async getById(id: number, companyId: number) {
    const product = await this.repository.findById(id, companyId)
    if (!product) {
      throw new NotFoundError('Produto')
    }
    return product
  }

  async create(data: CreateProductInput, companyId: number) {
    const existing = await this.repository.findByName(data.name, companyId)
    if (existing) {
      throw new ConflictError('Já existe um produto com este nome')
    }

    const deleted = await this.repository.findByNameIncludeDeleted(data.name, companyId)
    if (deleted) {
      return this.repository.restore(deleted.id, {
        name: data.name,
        description: data.description,
        price: data.price,
        status: data.status ?? 1,
      })
    }

    return this.repository.create(data, companyId)
  }

  async update(id: number, data: UpdateProductInput, companyId: number) {
    const product = await this.repository.findById(id, companyId)
    if (!product) {
      throw new NotFoundError('Produto')
    }

    if (data.name && data.name !== product.name) {
      const existing = await this.repository.findByName(data.name, companyId)
      if (existing) {
        throw new ConflictError('Já existe um produto com este nome')
      }
    }

    return this.repository.update(id, data)
  }

  async uploadImage(id: number, companyId: number, fileBuffer: Buffer, ext: string) {
    const product = await this.repository.findById(id, companyId)
    if (!product) {
      throw new NotFoundError('Produto')
    }

    if (product.image) {
      const oldPath = path.join(UPLOADS_DIR, product.image)
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
    }

    const filename = `products/${id}-${Date.now()}.${ext}`
    const filePath = path.join(UPLOADS_DIR, filename)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, fileBuffer)

    return this.repository.update(id, { image: filename })
  }

  async removeImage(id: number, companyId: number) {
    const product = await this.repository.findById(id, companyId)
    if (!product) {
      throw new NotFoundError('Produto')
    }

    if (product.image) {
      const filePath = path.join(UPLOADS_DIR, product.image)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }

    return this.repository.update(id, { image: null })
  }

  async delete(id: number, companyId: number) {
    const product = await this.repository.findById(id, companyId)
    if (!product) {
      throw new NotFoundError('Produto')
    }

    if (product.image) {
      const filePath = path.join(UPLOADS_DIR, product.image)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }

    await this.repository.delete(id, companyId)
  }
}
