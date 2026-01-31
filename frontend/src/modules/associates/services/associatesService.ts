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

// Mock data for fallback when API is not available
const mockAssociates: Associate[] = [
  {
    id: 1,
    name: 'José da Silva',
    cpf: '64908360090',
    email: 'josedasilva@gmail.com',
    phone: '31994040501',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Maria Santos',
    cpf: '12345678901',
    email: 'maria.santos@email.com',
    phone: '31999887766',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Carlos Oliveira',
    cpf: '98765432100',
    email: 'carlos.oliveira@email.com',
    phone: '31988776655',
    status: 'INACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Ana Paula Ferreira',
    cpf: '11122233344',
    email: 'ana.ferreira@email.com',
    phone: '31977665544',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'Roberto Costa',
    cpf: '55566677788',
    email: 'roberto.costa@email.com',
    phone: '31966554433',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const associatesService = {
  async getAll(params?: ListAssociatesParams): Promise<Associate[]> {
    try {
      const response = await api.get<PaginatedResponse<Associate>>('/api/associates', { params });
      return response.data.data;
    } catch (error) {
      console.warn('API not available, using mock data');
      // Fallback to mock data if API is not available
      return mockAssociates;
    }
  },

  async getById(id: number): Promise<Associate | null> {
    try {
      const response = await api.get<Associate>(`/api/associates/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API not available, using mock data');
      return mockAssociates.find(a => a.id === id) || null;
    }
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
