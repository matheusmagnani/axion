import { api } from '@/lib/axios';

export interface CompanyInfo {
  id: string;
  name: string;
  tradeName: string | null;
  cnpj: string;
  department: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  addressNumber: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
}

export interface UpdateCompanyInfoDTO {
  companyName?: string;
  tradeName?: string;
  cnpj?: string;
  department?: string;
  email?: string;
  phone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export const settingsService = {
  async getCompanyInfo(): Promise<CompanyInfo> {
    const response = await api.get<CompanyInfo>('/api/settings/company');
    return response.data;
  },

  async updateCompanyInfo(data: UpdateCompanyInfoDTO): Promise<CompanyInfo> {
    const response = await api.put<CompanyInfo>('/api/settings/company', data);
    return response.data;
  },
};
