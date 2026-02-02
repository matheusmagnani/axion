import { api } from '@/lib/axios';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    companyId: number;
    company: {
      id: number;
      companyName: string;
      tradeName: string | null;
      cnpj: string;
      department: string | null;
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

  async register(data: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    tradeName?: string;
    cnpj: string;
    department?: string;
  }) {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },
};
