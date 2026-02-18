import { FastifyReply, FastifyRequest } from 'fastify'
import { ProductService } from './product.service.js'
import { ValidationError } from '../../shared/errors/app-error.js'
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  idParamSchema,
} from './product.schema.js'

const service = new ProductService()

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export class ProductController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listProductsQuerySchema.parse(request.query)
    const { companyId } = request.user
    const result = await service.list(query, companyId)
    return reply.send(result)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params)
    const { companyId } = request.user
    const product = await service.getById(id, companyId)
    return reply.send(product)
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const isMultipart = request.isMultipart()

    let fields: Record<string, string> = {}
    let fileBuffer: Buffer | null = null
    let fileExt = ''

    if (isMultipart) {
      const parts = request.parts()
      for await (const part of parts) {
        if (part.type === 'file') {
          if (!ALLOWED_TYPES.includes(part.mimetype)) {
            throw new ValidationError('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP')
          }
          fileBuffer = await part.toBuffer()
          if (fileBuffer.length > 5 * 1024 * 1024) {
            throw new ValidationError('Arquivo muito grande.\nTamanho máximo: 5MB')
          }
          fileExt = part.filename.split('.').pop()!
        } else {
          fields[part.fieldname] = (part as { value: string }).value
        }
      }
    } else {
      fields = request.body as Record<string, string>
    }

    const data = createProductSchema.parse(fields)
    const { companyId } = request.user
    let product = await service.create(data, companyId)

    if (fileBuffer) {
      product = await service.uploadImage(product.id, companyId, fileBuffer, fileExt)
    }

    return reply.status(201).send(product)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params)
    const { companyId } = request.user
    const isMultipart = request.isMultipart()

    let fields: Record<string, string> = {}
    let fileBuffer: Buffer | null = null
    let fileExt = ''

    if (isMultipart) {
      const parts = request.parts()
      for await (const part of parts) {
        if (part.type === 'file') {
          if (!ALLOWED_TYPES.includes(part.mimetype)) {
            throw new ValidationError('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP')
          }
          fileBuffer = await part.toBuffer()
          if (fileBuffer.length > 5 * 1024 * 1024) {
            throw new ValidationError('Arquivo muito grande.\nTamanho máximo: 5MB')
          }
          fileExt = part.filename.split('.').pop()!
        } else {
          fields[part.fieldname] = (part as { value: string }).value
        }
      }
    } else {
      fields = request.body as Record<string, string>
    }

    const data = updateProductSchema.parse(fields)
    let product = await service.update(id, data, companyId)

    if (fileBuffer) {
      product = await service.uploadImage(id, companyId, fileBuffer, fileExt)
    }

    return reply.send(product)
  }

  async removeImage(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params)
    const { companyId } = request.user
    const product = await service.removeImage(id, companyId)
    return reply.send(product)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = idParamSchema.parse(request.params)
    const { companyId } = request.user
    await service.delete(id, companyId)
    return reply.status(204).send()
  }
}
