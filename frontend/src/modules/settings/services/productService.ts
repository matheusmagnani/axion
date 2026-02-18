import { api } from '@/lib/axios';

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  status: number;
  createdAt: string;
}

export interface ProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateProductDTO {
  name: string;
  description?: string;
  price: number;
  image?: File;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  status?: number;
  image?: File;
}

function buildFormData(data: Record<string, unknown>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  }
  return formData;
}

export const productService = {
  async list(): Promise<ProductsResponse> {
    const response = await api.get<ProductsResponse>('/api/products', {
      params: { limit: 100 },
    });
    return response.data;
  },

  async getById(id: number): Promise<Product> {
    const response = await api.get<Product>(`/api/products/${id}`);
    return response.data;
  },

  async create(data: CreateProductDTO): Promise<Product> {
    const formData = buildFormData(data);
    const response = await api.post<Product>('/api/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async update(id: number, data: UpdateProductDTO): Promise<Product> {
    const formData = buildFormData(data);
    const response = await api.put<Product>(`/api/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async removeImage(id: number): Promise<Product> {
    const response = await api.delete<Product>(`/api/products/${id}/image`);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/products/${id}`);
  },
};
