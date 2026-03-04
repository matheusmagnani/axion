import { api } from '@/lib/axios';

export interface BillingAssociate {
  id: number;
  name: string;
  cpf: string;
}

export interface Billing {
  id: number;
  description: string;
  value: string;
  subtotal: string | null;
  dueDate: string;
  paymentDate: string | null;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  type: string | null;
  origin: string | null;
  planId: number | null;
  productIds: number[];
  discountType: string | null;
  discountValue: string | null;
  associateId: number;
  contractId: number | null;
  companyId: number;
  createdAt: string;
  updatedAt: string;
  associate: BillingAssociate;
}

export interface BillingsResponse {
  data: Billing[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ListBillingsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface CreateBillingDTO {
  associateId: number;
  type: 'subscription' | 'single';
  origin: 'plan' | 'product';
  planId?: number | null;
  productIds?: number[];
  discountType?: string | null;
  discountValue?: number | null;
  description: string;
  dueDate: string;
  value: number;
  subtotal?: number | null;
}

export interface UpdateBillingDTO {
  status?: string;
  description?: string;
  dueDate?: string;
}

export interface SearchAssociate {
  id: number;
  name: string;
  cpf: string;
}

export const billingService = {
  async list(params?: ListBillingsParams): Promise<BillingsResponse> {
    const response = await api.get<BillingsResponse>('/api/billings', { params });
    return response.data;
  },

  async getById(id: number): Promise<Billing> {
    const response = await api.get<Billing>(`/api/billings/${id}`);
    return response.data;
  },

  async create(data: CreateBillingDTO): Promise<Billing> {
    const response = await api.post<Billing>('/api/billings', data);
    return response.data;
  },

  async update(id: number, data: UpdateBillingDTO): Promise<Billing> {
    const response = await api.put<Billing>(`/api/billings/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/billings/${id}`);
  },

  async searchAssociates(search: string): Promise<SearchAssociate[]> {
    const response = await api.get<SearchAssociate[]>('/api/billings/search-associates', {
      params: { search },
    });
    return response.data;
  },
};
