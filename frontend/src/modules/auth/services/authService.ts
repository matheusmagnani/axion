import { api } from '@/lib/axios';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    companyId: number;
    company: {
      id: number;
      companyName: string;
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
    };
  };
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  async uploadAvatar(file: File): Promise<{ avatar: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.patch<{ avatar: string }>('/api/auth/avatar', formData, {
      headers: { 'Content-Type': undefined },
    });
    const user = this.getUser();
    if (user) {
      user.avatar = response.data.avatar;
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  async removeAvatar(): Promise<void> {
    await api.delete('/api/auth/avatar');
    const user = this.getUser();
    if (user) {
      user.avatar = null;
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  async updateProfile(data: { name?: string; email?: string }): Promise<LoginResponse['user']> {
    const response = await api.patch<{ user: LoginResponse['user'] }>('/api/auth/profile', data);
    const user = this.getUser();
    if (user) {
      const updated = { ...user, ...response.data.user };
      localStorage.setItem('user', JSON.stringify(updated));
    }
    return response.data.user;
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    tradeName?: string;
    cnpj: string;
    department?: string;
    companyEmail?: string;
    phone?: string;
    address?: string;
    addressNumber?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }) {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },
};
