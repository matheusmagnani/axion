import { api } from '@/lib/axios';

export interface Role {
  id: number;
  name: string;
  status: number;
  createdAt: string;
  _count: {
    users: number;
  };
}

export interface RolesResponse {
  data: Role[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateRoleDTO {
  name: string;
  status?: number;
}

export interface UpdateRoleDTO {
  name?: string;
  status?: number;
}

export const roleService = {
  async list(): Promise<RolesResponse> {
    const response = await api.get<RolesResponse>('/api/roles', {
      params: { limit: 100 },
    });
    return response.data;
  },

  async create(data: CreateRoleDTO): Promise<Role> {
    const response = await api.post<Role>('/api/roles', data);
    return response.data;
  },

  async update(id: number, data: UpdateRoleDTO): Promise<Role> {
    const response = await api.put<Role>(`/api/roles/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/roles/${id}`);
  },
};
