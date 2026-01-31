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
      error: 'Validation Error',
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
    return reply.status(409).send({
      statusCode: 409,
      error: 'Conflict',
      message: 'Registro já existe',
    });
  }

  // Erro interno (500)
  return reply.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor',
  });
}
