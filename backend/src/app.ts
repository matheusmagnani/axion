import path from 'node:path';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { errorHandler } from './shared/middlewares/error-handler.js';
import { registerAuthHook } from './shared/middlewares/auth.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { associateRoutes } from './modules/associates/associate.routes.js';
import { collaboratorRoutes } from './modules/collaborators/collaborator.routes.js';
import { settingsRoutes } from './modules/settings/settings.routes.js';
import { roleRoutes } from './modules/roles/role.routes.js';
import { permissionRoutes } from './modules/permissions/permission.routes.js';
import { prisma } from './infra/database/prisma/client.js';

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'info' : 'error',
    transport: process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
});

// Start server
const PORT = Number(process.env.PORT) || 3333;
const HOST = process.env.HOST || '0.0.0.0';

const start = async () => {
  try {
    // Plugins
    await app.register(cors, {
      origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
      credentials: true,
    });

    await app.register(helmet, {
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    });

    await app.register(multipart, {
      limits: { fileSize: 5 * 1024 * 1024 },
    });

    await app.register(fastifyStatic, {
      root: path.join(process.cwd(), 'uploads'),
      prefix: '/uploads/',
      decorateReply: false,
    });

    await app.register(jwt, {
      secret: process.env.JWT_SECRET || 'axion-secret',
    });

    // Global error handler
    app.setErrorHandler(errorHandler);

    // Auth hook (protects all routes except public ones)
    registerAuthHook(app);

    // Health check
    app.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Routes
    app.register(authRoutes, { prefix: '/api/auth' });
    app.register(associateRoutes, { prefix: '/api/associates' });
    app.register(collaboratorRoutes, { prefix: '/api/collaborators' });
    app.register(settingsRoutes, { prefix: '/api/settings' });
    app.register(roleRoutes, { prefix: '/api/roles' });
    app.register(permissionRoutes, { prefix: '/api/permissions' });

    // Test database connection
    await prisma.$connect();
    console.log('Database connected');

    await app.listen({ port: PORT, host: HOST });
    console.log(`Server running on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  await app.close();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

start();
