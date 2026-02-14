import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log do erro
  console.error(`[ERROR] ${request.method} ${request.url}:`, error);

  // Erro de validação do Zod
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Erro de Validação',
      message: 'Dados inválidos',
      issues: error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Erro da aplicação (AppError)
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name,
      message: error.message,
    });
  }

  // Erro do Prisma - Unique constraint
  if (error.message?.includes('Unique constraint')) {
    let message = 'Registro já existe';

    // Identifica qual campo causou o conflito
    if (error.message.includes('email')) {
      message = 'Email já cadastrado';
    } else if (error.message.includes('cnpj')) {
      message = 'CNPJ já cadastrado';
    } else if (error.message.includes('cpf')) {
      message = 'CPF já cadastrado';
    }

    return reply.status(409).send({
      statusCode: 409,
      error: 'Conflito',
      message,
    });
  }

  // Erro de arquivo muito grande (multipart)
  if (error.code === 'FST_REQ_FILE_TOO_LARGE' || error.message?.includes('file too large')) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Erro de Validação',
      message: 'Arquivo muito grande.\nTamanho máximo: 5MB',
    });
  }

  // Erro interno (500)
  return reply.status(500).send({
    statusCode: 500,
    error: 'Erro Interno do Servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor',
  });
}
