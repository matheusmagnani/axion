import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  companyName: z.string().min(1, 'Razão social é obrigatória'),
  tradeName: z.string().min(1, 'Nome fantasia é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  department: z.string().min(1, 'Departamento é obrigatório'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
