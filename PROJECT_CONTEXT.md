# Axion — Project Context

## Stack

- **Backend:** Fastify + Prisma + PostgreSQL + TypeScript
- **Frontend:** React + Vite + TailwindCSS + TypeScript
- **Dev runner:** tsx (watch mode)

## Backend

### Plugins registrados (app.ts)

- `@fastify/cors` — origins localhost:5173, 5174
- `@fastify/helmet` — com crossOriginResourcePolicy: cross-origin
- `@fastify/jwt` — secret via env
- `@fastify/multipart` — limite 5MB
- `@fastify/static` — serve `uploads/` em `/uploads/`

### Módulos

- **auth** — login, register, refresh, upload/remove avatar
- **associates** — CRUD de associados
- **collaborators** — CRUD de colaboradores

### Models (Prisma)

- Company, User, Associate, Contract, Billing
- User possui campo `avatar` (String?) — caminho relativo do arquivo

### Endpoints de Auth

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /api/auth/login | Não | Login |
| POST | /api/auth/register | Não | Registro |
| POST | /api/auth/refresh | Sim | Refresh token |
| PATCH | /api/auth/avatar | Sim | Upload de foto de perfil |
| DELETE | /api/auth/avatar | Sim | Remover foto de perfil |
| PATCH | /api/auth/profile | Sim | Atualizar nome/email |

### Upload de avatars

- Arquivos salvos em `backend/uploads/avatars/`
- Nome: `{userId}-{timestamp}.{ext}`
- Tipos permitidos: JPEG, PNG, WebP
- Tamanho máximo: 5MB
- `backend/uploads/` está no .gitignore

## Frontend

### Auth Service (authService.ts)

- `login`, `register`, `logout`, `isAuthenticated`, `getUser`
- `uploadAvatar(file)` — PATCH multipart
- `removeAvatar()` — DELETE
- `updateProfile({ name?, email? })` — PATCH /api/auth/profile

### Header

- Avatar exibe foto do usuário ou iniciais
- Modo de edição: nome e email viram inputs, avatar ganha menu (mudar/remover foto), botões Salvar/Cancelar
- Ícones: PencilSimple, SignOut, Flask (phosphor-icons)

### Design Tokens (globals.css)

**Cores:**
| Variável CSS | Tailwind | Valor |
|--------------|----------|-------|
| `--color-app-bg` | `app-bg` | #1E232C |
| `--color-app-primary` | `app-primary` | #16171C |
| `--color-app-secondary` | `app-secondary` | #E6C284 |
| `--color-app-accent` | `app-accent` | #1E232C |
| `--color-app-gray` | `app-gray` | #8A919C |

Variáveis RGB disponíveis para uso com `rgba()`: `--color-app-*-rgb`

**Tamanhos de Fonte:**
| Variável CSS | Tailwind | Valor |
|--------------|----------|-------|
| `--font-size-xs` | `text-xs` | 0.75rem (12px) |
| `--font-size-sm` | `text-sm` | 0.875rem (14px) |
| `--font-size-base` | `text-base` | 1rem (16px) |
| `--font-size-lg` | `text-lg` | 1.125rem (18px) |
| `--font-size-xl` | `text-xl` | 1.25rem (20px) |
| `--font-size-2xl` | `text-2xl` | 1.5rem (24px) |
| `--font-size-3xl` | `text-3xl` | 1.875rem (30px) |

**Pesos de Fonte:**
| Variável CSS | Tailwind | Valor |
|--------------|----------|-------|
| `--font-weight-normal` | `font-normal` | 400 |
| `--font-weight-medium` | `font-medium` | 500 |
| `--font-weight-semibold` | `font-semibold` | 600 |
| `--font-weight-bold` | `font-bold` | 700 |

**Line Heights:**
| Variável CSS | Tailwind | Valor |
|--------------|----------|-------|
| `--line-height-tight` | `leading-tight` | 1.2 |
| `--line-height-normal` | `leading-normal` | 1.5 |
| `--line-height-relaxed` | `leading-relaxed` | 1.75 |
