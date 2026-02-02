import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: number; companyId: number };
    user: { userId: number; companyId: number };
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ statusCode: 401, error: 'Não autorizado', message: 'Token inválido ou ausente' });
  }
}

export function registerAuthHook(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    // Skip auth for public routes
    if (
      request.url === '/health' ||
      request.url.startsWith('/api/auth/')
    ) {
      return;
    }

    await authenticate(request, reply);
  });
}
