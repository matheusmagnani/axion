import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { prisma } from '../../infra/database/prisma/client.js';
import { UnauthorizedError, ConflictError } from '../../shared/errors/app-error.js';
import type { LoginInput, RegisterInput, UpdateProfileInput, ChangePasswordInput } from './auth.schema.js';
import type { FastifyInstance } from 'fastify';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export class AuthService {
  private app: FastifyInstance;

  constructor(app: FastifyInstance) {
    this.app = app;
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findFirst({
      where: { email: data.email, deletedAt: null },
      include: { company: true, role: { select: { id: true, name: true } } },
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
        avatar: user.avatar,
        companyId: user.companyId,
        roleId: user.roleId,
        role: user.role,
        company: {
          id: user.company.id,
          companyName: user.company.companyName,
          tradeName: user.company.tradeName,
          cnpj: user.company.cnpj,
          department: user.company.department,
          email: user.company.email,
          phone: user.company.phone,
          address: user.company.address,
          addressNumber: user.company.addressNumber,
          complement: user.company.complement,
          neighborhood: user.company.neighborhood,
          city: user.company.city,
          state: user.company.state,
          zipCode: user.company.zipCode,
        },
      },
    };
  }

  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findFirst({
      where: { email: data.email, deletedAt: null },
    });
    if (existingUser) {
      throw new ConflictError('Email já cadastrado');
    }

    const existingCompany = await prisma.company.findFirst({
      where: { cnpj: data.cnpj, deletedAt: null },
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
        email: data.companyEmail,
        phone: data.phone,
        address: data.address,
        addressNumber: data.addressNumber,
        complement: data.complement || null,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      },
    });

    const defaultRole = await prisma.role.create({
      data: {
        name: 'Administrativo',
        companyId: company.id,
        status: 1,
      },
    });

    const modules = ['associates', 'billings', 'connections', 'collaborators', 'settings'];
    const actions = ['read', 'create', 'edit', 'delete'];

    await prisma.permission.createMany({
      data: modules.flatMap((module) =>
        actions.map((action) => ({
          roleId: defaultRole.id,
          module,
          action,
          allowed: true,
        }))
      ),
    });

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        companyId: company.id,
        roleId: defaultRole.id,
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

  async uploadAvatar(userId: number, fileBuffer: Buffer, ext: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedError('Usuário não encontrado');

    // Delete old avatar file
    if (user.avatar) {
      const oldPath = path.join(UPLOADS_DIR, user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const filename = `avatars/${userId}-${Date.now()}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, fileBuffer);

    await prisma.user.update({ where: { id: userId }, data: { avatar: filename } });
    return { avatar: filename };
  }

  async removeAvatar(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedError('Usuário não encontrado');

    if (user.avatar) {
      const filePath = path.join(UPLOADS_DIR, user.avatar);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await prisma.user.update({ where: { id: userId }, data: { avatar: null } });
    }

    return { avatar: null };
  }

  async updateProfile(userId: number, data: UpdateProfileInput) {
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, id: { not: userId }, deletedAt: null },
      });
      if (existing) throw new ConflictError('Email já cadastrado');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.roleId !== undefined && { roleId: data.roleId }),
      },
      include: { company: true, role: { select: { id: true, name: true } } },
    });

    return {
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        avatar: updated.avatar,
        companyId: updated.companyId,
        roleId: updated.roleId,
        role: updated.role,
        company: {
          id: updated.company.id,
          companyName: updated.company.companyName,
          tradeName: updated.company.tradeName,
          cnpj: updated.company.cnpj,
          department: updated.company.department,
          email: updated.company.email,
          phone: updated.company.phone,
          address: updated.company.address,
          addressNumber: updated.company.addressNumber,
          complement: updated.company.complement,
          neighborhood: updated.company.neighborhood,
          city: updated.company.city,
          state: updated.company.state,
          zipCode: updated.company.zipCode,
        },
      },
    };
  }

  async changePassword(userId: number, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedError('Usuário não encontrado');

    const validPassword = await bcrypt.compare(data.currentPassword, user.password);
    if (!validPassword) {
      throw new UnauthorizedError('Senha atual incorreta');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Senha alterada com sucesso' };
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
