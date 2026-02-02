import bcrypt from 'bcryptjs';
import { prisma } from '../../infra/database/prisma/client.js';
import { UnauthorizedError } from '../../shared/errors/app-error.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';
import { ConflictError } from '../../shared/errors/app-error.js';
import type { FastifyInstance } from 'fastify';

export class AuthService {
  private app: FastifyInstance;

  constructor(app: FastifyInstance) {
    this.app = app;
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { company: true },
    });

    if (!user || !user.active) {
      throw new UnauthorizedError('Email ou senha inválidos');
    }

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
      throw new UnauthorizedError('Email ou senha inválidos');
    }

    const token = this.app.jwt.sign(
      { userId: user.id, companyId: user.companyId },
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        companyId: user.companyId,
        company: {
          id: user.company.id,
          companyName: user.company.companyName,
          tradeName: user.company.tradeName,
          cnpj: user.company.cnpj,
          department: user.company.department,
        },
      },
    };
  }

  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictError('Email já cadastrado');
    }

    const existingCompany = await prisma.company.findUnique({
      where: { cnpj: data.cnpj },
    });
    if (existingCompany) {
      throw new ConflictError('CNPJ já cadastrado');
    }

    const hashedPassword = await AuthService.hashPassword(data.password);

    const company = await prisma.company.create({
      data: {
        companyName: data.companyName,
        tradeName: data.tradeName,
        cnpj: data.cnpj,
        department: data.department,
      },
    });

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        companyId: company.id,
      },
    });

    return { message: 'Conta criada com sucesso' };
  }

  async refresh(userId: number, companyId: number) {
    const token = this.app.jwt.sign(
      { userId, companyId },
      { expiresIn: '7d' }
    );
    return { token };
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
