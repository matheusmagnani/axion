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

- **auth** — login, register, refresh, upload/remove avatar, update profile (name, email, roleId)
- **associates** — CRUD de associados
- **collaborators** — CRUD completo de colaboradores (listagem, criação, edição, soft delete, toggle active, change password, com roleId/role)
- **settings** — configurações da empresa (GET/PUT company info)
- **roles** — CRUD de setores por empresa
- **permissions** — Gerenciamento de permissões por setor (GET/PUT por roleId)
- **products** — CRUD de produtos por empresa (nome, descrição, valor, imagem, status) com upload de imagem

### Models (Prisma)

- Company, User, Associate, Contract, Billing, Role, Permission, Product
- User possui campo `avatar` (String?) — caminho relativo do arquivo
- User possui campo `roleId` (Int?) — setor do usuário (relação com Role)
- Role pertence a uma Company (cada empresa tem seus próprios setores)
- Role possui campo `status` (Int: 0 = inativo, 1 = ativo, default 1)
- Permission pertence a um Role (roleId, module, action, allowed) — @@unique([roleId, module, action])
- Company possui campos de contato: email, phone, address, neighborhood, city, state, zipCode
- **Todas as tabelas possuem `deletedAt DateTime?`** — soft delete (ao excluir, seta `deletedAt = now()` em vez de deletar fisicamente)
- Todas as queries de listagem/busca filtram por `deletedAt: null` para excluir registros soft-deleted

### Enums / Status (padrão inteiro)

- **Associate status** — `Int`: 0 = inativo, 1 = ativo, 2 = pendente (default 2)
- **Role status** — `Int`: 0 = inativo, 1 = ativo (default 1)
- **Product status** — `Int`: 0 = inativo, 1 = ativo (default 1)
- `ContractStatus` — ACTIVE, ENDED, CANCELLED, PENDING (enum)
- `BillingStatus` — PENDING, PAID, OVERDUE, CANCELLED (enum)

### Padrão de Soft Delete

- Todas as tabelas (Company, User, Associate, Contract, Billing, Role, Product) possuem campo `deletedAt`
- Ao excluir um registro, setar `deletedAt = new Date()` **E inativar** (`status = 0` para Associate/Role/Product, `active = false` para User)
- Em todas as queries de leitura (findAll, findById, findByName, etc.), adicionar `deletedAt: null` no `where`
- Registros soft-deleted não aparecem em listagens e não podem ser usados para login

### Padrão de Criação com Restauração de Soft-Deleted

- Ao criar um registro, se já existe um soft-deleted com a mesma chave única (cpf, email, name), **restaurar** o registro existente em vez de criar um novo
- Fluxo: 1) Verificar se ativo existe (conflito) → 2) Verificar se deletado existe (restaurar) → 3) Criar novo
- Restaurar = setar `deletedAt = null`, atualizar campos com os novos dados, reativar (status/active)
- Isso evita conflitos de constraint `@@unique` no banco de dados

### Endpoints de Auth

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /api/auth/login | Não | Login |
| POST | /api/auth/register | Não | Registro |
| POST | /api/auth/refresh | Sim | Refresh token |
| PATCH | /api/auth/avatar | Sim | Upload de foto de perfil |
| DELETE | /api/auth/avatar | Sim | Remover foto de perfil |
| PATCH | /api/auth/profile | Sim | Atualizar nome/email/roleId |
| PATCH | /api/auth/change-password | Sim | Alterar senha (requer senha atual) |

### Endpoints de Collaborators

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/collaborators | Sim | Listar colaboradores (paginação, busca, filtro) |
| POST | /api/collaborators | Sim | Criar colaborador |
| PUT | /api/collaborators/:id | Sim | Atualizar colaborador |
| PATCH | /api/collaborators/:id/change-password | Sim | Alterar senha do colaborador |
| PATCH | /api/collaborators/:id/toggle-active | Sim | Ativar/inativar colaborador |
| DELETE | /api/collaborators/:id | Sim | Excluir colaborador (soft delete) |

### Endpoints de Settings

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/settings/company | Sim | Buscar informações da empresa |
| PUT | /api/settings/company | Sim | Atualizar informações da empresa |

### Endpoints de Roles

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/roles | Sim | Listar setores (com paginação, busca, ordenação, filtro por status) |
| GET | /api/roles/:id | Sim | Buscar setor por ID |
| POST | /api/roles | Sim | Criar setor |
| PUT | /api/roles/:id | Sim | Atualizar setor (nome e/ou status) |
| DELETE | /api/roles/:id | Sim | Excluir setor (bloqueia se houver usuários vinculados) |

### Endpoints de Permissions

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/permissions/:roleId | Sim | Buscar permissões de um setor |
| PUT | /api/permissions/:roleId | Sim | Atualizar permissões de um setor (array de { module, action, allowed }) |

Módulos: `associates`, `billings`, `connections`, `collaborators`, `settings`
Ações: `read`, `create`, `edit`, `delete`

### Endpoints de Products

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/products | Sim | Listar produtos (paginação, busca, filtro status) |
| GET | /api/products/:id | Sim | Buscar produto por ID |
| POST | /api/products | Sim | Criar produto (multipart: name, description, price, image?) |
| PUT | /api/products/:id | Sim | Atualizar produto (multipart: name?, description?, price?, status?, image?) |
| DELETE | /api/products/:id/image | Sim | Remover imagem do produto |
| DELETE | /api/products/:id | Sim | Excluir produto (soft delete) |

### Upload de avatars

- Arquivos salvos em `backend/uploads/avatars/`
- Nome: `{userId}-{timestamp}.{ext}`
- Tipos permitidos: JPEG, PNG, WebP
- Tamanho máximo: 5MB
- `backend/uploads/` está no .gitignore

### Upload de imagens de produtos

- Arquivos salvos em `backend/uploads/products/`
- Nome: `{productId}-{timestamp}.{ext}`
- Tipos permitidos: JPEG, PNG, WebP
- Tamanho máximo: 5MB

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

### Módulo Settings (Configurações)

Página de configurações com múltiplos módulos/seções:

**Estrutura:**
```
modules/settings/
├── pages/
│   └── SettingsPage.tsx
├── components/
│   ├── SettingsSection.tsx      # Componente base para seções expansíveis
│   ├── CompanyInfoSection.tsx   # Seção de informações da empresa
│   ├── RolesSection.tsx         # Seção de setores (CRUD + toggle status)
│   ├── PermissionsSection.tsx   # Seção de permissões por setor (grid módulo x ação)
│   └── ProductsSection.tsx      # Seção de produtos (CRUD + toggle status + upload imagem)
├── hooks/
│   ├── useSettings.ts           # Hooks React Query (useCompanyInfo, useUpdateCompanyInfo)
│   ├── useRoles.ts              # Hooks React Query (useRoles, useCreateRole, useUpdateRole, useDeleteRole)
│   ├── usePermissions.ts        # Hooks React Query (usePermissions, useUpdatePermissions)
│   └── useProducts.ts           # Hooks React Query (useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useRemoveProductImage)
└── services/
    ├── settingsService.ts       # API service (company info)
    ├── roleService.ts           # API service (roles CRUD)
    ├── permissionService.ts     # API service (permissions GET/PUT by roleId)
    └── productService.ts        # API service (products CRUD + upload/remove image)
```

**Seções implementadas:**
- **Informações da Empresa** — nome, nome fantasia, CNPJ, departamento, email, telefone, endereço (rua, bairro, cidade, estado, CEP)
- **Setores** — CRUD de setores com toggle de status (ativo/inativo), edição de nome, exclusão com confirmação
- **Permissões** — Grid de permissões por setor (módulos x ações com checkboxes), select de setor, salvar permissões

- **Produtos** — CRUD de produtos com nome, descrição, valor (R$), imagem (upload), toggle de status (ativo/inativo), exclusão com confirmação

### Módulo Associates (Associados)

**Estrutura:**
```
modules/associates/
├── pages/
│   ├── AssociatesPage.tsx         # Listagem de associados
│   └── AssociateDetailPage.tsx    # Página de detalhe do associado
├── components/
│   ├── AssociatesHeader.tsx       # Header com busca, filtros e botão criar
│   ├── AssociatesTable.tsx        # Tabela/listagem de associados (clique no nome navega para detalhe)
│   └── AssociateForm.tsx          # Formulário de criação/edição
├── hooks/
│   └── useAssociates.ts           # Hooks React Query (useAssociates, useAssociate, useCreate/Update/Delete)
└── services/
    └── associatesService.ts       # API service (interfaces: Associate, AssociateDetail, Contract, Billing)
```

**Página de Detalhe (`/associates/:id`):**
- Header com botão voltar, nome, StatusBadge, botões editar/excluir (com permissões)
- Seção Informações Pessoais (CPF, email, telefone, data de cadastro)
- Seção Contratos (lista de contratos com status, valor, período)
- Seção Cobranças (lista de cobranças com status, valor, vencimento, pagamento)
- Modal de edição reutiliza AssociateForm
- Modal de confirmação de exclusão com redirect para listagem

### Permissões no Frontend (Enforcement)

O sistema de permissões é aplicado no frontend via hook compartilhado:

**Hook:** `shared/hooks/useMyPermissions.ts`
- `useMyPermissions()` — retorna `{ permissions, isLoading, isAdmin }`
- `useCanAccess(module, action)` — retorna `boolean`
- Se `roleId` é `null` (admin/dono) → acesso total
- Se `roleId` existe → busca permissões via `GET /api/permissions/:roleId`

**Mapeamento path→module (`PATH_TO_MODULE`):**
- `/associates` → `associates`
- `/billings` → `billings`
- `/connections` → `connections`
- `/collaborators` → `collaborators`
- `/settings` → `settings`

**Onde é aplicado:**
- **Sidebar** — filtra itens do menu (só exibe módulos com `read`)
- **Rotas** — `PermissionRoute` em `AppRoutes.tsx` redireciona para `/dashboard` se sem `read`
- **Associados** — botão criar, editar, toggle status e excluir condicionados por `create`/`edit`/`delete`
- **Colaboradores** — botão criar, editar, toggle, alterar senha e excluir condicionados por `create`/`edit`/`delete`
