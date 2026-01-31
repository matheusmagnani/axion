import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { errorHandler } from './shared/middlewares/error-handler.js';
import { associateRoutes } from './modules/associates/associate.routes.js';
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
      origin: ['http://localhost:5173', 'http://localhost:5174'],
      credentials: true,
    });

    await app.register(helmet);

    // Global error handler
    app.setErrorHandler(errorHandler);

    // Health check
    app.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Routes
    app.register(associateRoutes, { prefix: '/api/associates' });

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await prisma.$disconnect();
  await app.close();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

start();