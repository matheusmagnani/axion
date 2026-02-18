import { api } from '@/lib/axios';

export interface Permission {
  id: number;
  roleId: number;
  module: string;
  action: string;
  allowed: boolean;
}

export interface UpdatePermissionItem {
  module: string;
  action: string;
  allowed: boolean;
}

export const permissionService = {
  async getByRoleId(roleId: number): Promise<Permission[]> {
    const response = await api.get<Permission[]>(`/api/permissions/${roleId}`);
    return response.data;
  },

  async updateByRoleId(roleId: number, permissions: UpdatePermissionItem[]): Promise<Permission[]> {
    const response = await api.put<Permission[]>(`/api/permissions/${roleId}`, permissions);
    return response.data;
  },
};
