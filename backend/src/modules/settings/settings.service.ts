import { prisma } from '../../infra/database/prisma/client.js';
import { NotFoundError } from '../../shared/errors/app-error.js';
import type { UpdateCompanyInput } from './settings.schema.js';

export class SettingsService {
  async getCompanyInfo(companyId: number) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundError('Empresa não encontrada');
    }

    return {
      id: company.id,
      name: company.companyName,
      tradeName: company.tradeName,
      cnpj: company.cnpj,
      department: company.department,
      email: company.email,
      phone: company.phone,
      address: company.address,
      addressNumber: company.addressNumber,
      complement: company.complement,
      neighborhood: company.neighborhood,
      city: company.city,
      state: company.state,
      zipCode: company.zipCode,
    };
  }

  async updateCompanyInfo(companyId: number, data: UpdateCompanyInput) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundError('Empresa não encontrada');
    }

    const updated = await prisma.company.update({
      where: { id: companyId },
      data: {
        ...(data.companyName !== undefined && { companyName: data.companyName }),
        ...(data.tradeName !== undefined && { tradeName: data.tradeName }),
        ...(data.cnpj !== undefined && { cnpj: data.cnpj }),
        ...(data.department !== undefined && { department: data.department }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.addressNumber !== undefined && { addressNumber: data.addressNumber || null }),
        ...(data.complement !== undefined && { complement: data.complement || null }),
        ...(data.neighborhood !== undefined && { neighborhood: data.neighborhood || null }),
        ...(data.city !== undefined && { city: data.city || null }),
        ...(data.state !== undefined && { state: data.state || null }),
        ...(data.zipCode !== undefined && { zipCode: data.zipCode || null }),
      },
    });

    return {
      id: updated.id,
      name: updated.companyName,
      tradeName: updated.tradeName,
      cnpj: updated.cnpj,
      department: updated.department,
      email: updated.email,
      phone: updated.phone,
      address: updated.address,
      addressNumber: updated.addressNumber,
      complement: updated.complement,
      neighborhood: updated.neighborhood,
      city: updated.city,
      state: updated.state,
      zipCode: updated.zipCode,
    };
  }
}
