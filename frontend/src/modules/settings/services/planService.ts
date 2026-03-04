import { api } from '@/lib/axios';

export interface Plan {
  id: number;
  name: string;
  description: string | null;
  productIds: number[];
  discountType: string | null;
  discountValue: string | null;
  status: number;
  createdAt: string;
}

export interface PlansResponse {
  data: Plan[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreatePlanDTO {
  name: string;
  description?: string;
  productIds: number[];
  discountType?: string | null;
  discountValue?: number | null;
}

export interface UpdatePlanDTO {
  name?: string;
  description?: string;
  productIds?: number[];
  discountType?: string | null;
  discountValue?: number | null;
  status?: number;
}

export const planService = {
  async list(): Promise<PlansResponse> {
    const response = await api.get<PlansResponse>('/api/plans', {
      params: { limit: 100 },
    });
    return response.data;
  },

  async getById(id: number): Promise<Plan> {
    const response = await api.get<Plan>(`/api/plans/${id}`);
    return response.data;
  },

  async create(data: CreatePlanDTO): Promise<Plan> {
    const response = await api.post<Plan>('/api/plans', data);
    return response.data;
  },

  async update(id: number, data: UpdatePlanDTO): Promise<Plan> {
    const response = await api.put<Plan>(`/api/plans/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/plans/${id}`);
  },
};
