import { api } from '@/lib/axios';

export interface Associate {
  id: number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: number;
  number: string;
  description: string | null;
  value: string;
  startDate: string;
  endDate: string | null;
  status: 'ACTIVE' | 'ENDED' | 'CANCELLED' | 'PENDING';
  associateId: number;
  companyId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Billing {
  id: number;
  description: string;
  value: string;
  dueDate: string;
  paymentDate: string | null;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  associateId: number;
  contractId: number | null;
  companyId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AssociateDetail extends Associate {
  contracts: Contract[];
  billings: Billing[];
}

export interface CreateAssociateDTO {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  status?: number;
}

export interface UpdateAssociateDTO {
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  status?: number;
}

export interface ListAssociatesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const associatesService = {
  async getAll(params?: ListAssociatesParams): Promise<PaginatedResponse<Associate>> {
    const response = await api.get<PaginatedResponse<Associate>>('/api/associates', { params });
    return response.data;
  },

  async getById(id: number): Promise<AssociateDetail> {
    const response = await api.get<AssociateDetail>(`/api/associates/${id}`);
    return response.data;
  },

  async create(data: CreateAssociateDTO): Promise<Associate> {
    const response = await api.post<Associate>('/api/associates', data);
    return response.data;
  },

  async update(id: number, data: UpdateAssociateDTO): Promise<Associate> {
    const response = await api.put<Associate>(`/api/associates/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/associates/${id}`);
  },
};
