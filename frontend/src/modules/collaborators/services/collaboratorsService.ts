import { api } from '@/lib/axios';

export interface Collaborator {
  id: number;
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollaboratorDTO {
  name: string;
  email: string;
  password: string;
}

export interface UpdateCollaboratorDTO {
  name?: string;
  email?: string;
}

export interface ListCollaboratorsParams {
  page?: number;
  limit?: number;
  search?: string;
  active?: string;
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

export const collaboratorsService = {
  async getAll(params?: ListCollaboratorsParams): Promise<PaginatedResponse<Collaborator>> {
    const response = await api.get<PaginatedResponse<Collaborator>>('/api/collaborators', { params });
    return response.data;
  },

  async create(data: CreateCollaboratorDTO): Promise<Collaborator> {
    const response = await api.post<Collaborator>('/api/collaborators', data);
    return response.data;
  },

  async update(id: number, data: UpdateCollaboratorDTO): Promise<Collaborator> {
    const response = await api.put<Collaborator>(`/api/collaborators/${id}`, data);
    return response.data;
  },

  async changePassword(id: number, password: string): Promise<Collaborator> {
    const response = await api.patch<Collaborator>(`/api/collaborators/${id}/change-password`, { password });
    return response.data;
  },

  async toggleActive(id: number): Promise<Collaborator> {
    const response = await api.patch<Collaborator>(`/api/collaborators/${id}/toggle-active`);
    return response.data;
  },
};
