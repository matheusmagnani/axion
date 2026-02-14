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
  companyName: z.string().min(3, 'Razão social deve ter pelo menos 3 caracteres'),
  tradeName: z.string().min(2, 'Nome fantasia deve ter pelo menos 2 caracteres'),
  cnpj: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 14, 'CNPJ deve ter 14 dígitos'),
  department: z.string().min(1, 'Departamento é obrigatório'),
  companyEmail: z.string().email('Email da empresa inválido'),
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length >= 10 && val.length <= 11, 'Telefone deve ter 10 ou 11 dígitos'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  addressNumber: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional().or(z.literal('')),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z
    .string()
    .length(2, 'UF deve ter 2 caracteres')
    .transform((val) => val.toUpperCase()),
  zipCode: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 8, 'CEP deve ter 8 dígitos'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
