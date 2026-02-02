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

### Header

- Avatar exibe foto do usuário ou iniciais
- Dropdown com: Trocar foto, Remover foto (se tem avatar), Sair
- Ícones: Camera, Trash, SignOut (phosphor-icons)
