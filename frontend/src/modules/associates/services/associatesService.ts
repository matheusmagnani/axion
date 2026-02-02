import { api } from '@/lib/axios';

export interface Associate {
  id: number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssociateDTO {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export interface UpdateAssociateDTO {
  name?: string;
  cpf?: string;
  email?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
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

  async getById(id: number): Promise<Associate> {
    const response = await api.get<Associate>(`/api/associates/${id}`);
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
