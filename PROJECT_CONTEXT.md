# Axion — Project Context

## Stack

- **Backend:** Fastify + Prisma + PostgreSQL + TypeScript + BullMQ (filas)
- **Frontend:** React + Vite + TailwindCSS + TypeScript + xlsx (SheetJS)
- **Dev runner:** tsx (watch mode)
- **Queue:** Redis + BullMQ (processamento assíncrono de jobs)

## Backend

### Plugins registrados (app.ts)

- `@fastify/cors` — origins localhost:5173, 5174
- `@fastify/helmet` — com crossOriginResourcePolicy: cross-origin
- `@fastify/jwt` — secret via env
- `@fastify/multipart` — limite 5MB
- `@fastify/static` — serve `uploads/` em `/uploads/`

### Módulos

- **auth** — login, register, refresh, upload/remove avatar, update profile (name, email, roleId)
- **associates** — CRUD de associados + importação em massa via planilha (BullMQ)
- **collaborators** — CRUD completo de colaboradores (listagem, criação, edição, soft delete, toggle active, change password, com roleId/role)
- **settings** — configurações da empresa (GET/PUT company info)
- **roles** — CRUD de setores por empresa
- **permissions** — Gerenciamento de permissões por setor (GET/PUT por roleId)
- **products** — CRUD de produtos por empresa (nome, descrição, valor, imagem, status) com upload de imagem
- **plans** — CRUD de planos por empresa (nome, descrição, productIds[], discountType, discountValue, status). Plano agrupa produtos e permite desconto (% ou R$)
- **billings** — CRUD de cobranças avulsas por empresa (type, origin, planId, productIds[], discountType, discountValue, subtotal, value). Suporta cobranças vinculadas a planos ou produtos avulsos, com desconto adicional. Inclui busca de associados por nome/CPF

### Models (Prisma)

- Company, User, Associate, Contract, Billing, Role, Permission, Product, Plan, ImportJob
- Billing possui campos: type (subscription|single), origin (plan|product), planId, productIds[], discountType, discountValue, subtotal, value (final)
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
- **Plan status** — `Int`: 0 = inativo, 1 = ativo (default 1)
- `ContractStatus` — ACTIVE, ENDED, CANCELLED, PENDING (enum)
- `BillingStatus` — PENDING, PAID, OVERDUE, CANCELLED (enum)
- `ImportJobStatus` — PENDING, PROCESSING, COMPLETED, FAILED (enum)

### Padrão de Soft Delete

- Todas as tabelas (Company, User, Associate, Contract, Billing, Role, Product, Plan) possuem campo `deletedAt`
- Ao excluir um registro, setar `deletedAt = new Date()` **E inativar** (`status = 0` para Associate/Role/Product/Plan, `active = false` para User)
- Em todas as queries de leitura (findAll, findById, findByName, etc.), adicionar `deletedAt: null` no `where`
- Registros soft-deleted não aparecem em listagens e não podem ser usados para login

### Padrão de Criação com Restauração de Soft-Deleted

- Ao criar um registro, se já existe um soft-deleted com a mesma chave única (cpf, email, name), **restaurar** o registro existente em vez de criar um novo
- Fluxo: 1) Verificar se ativo existe (conflito) → 2) Verificar se deletado existe (restaurar) → 3) Criar novo
- Restaurar = setar `deletedAt = null`, atualizar campos com os novos dados, reativar (status/active)
- Isso evita conflitos de constraint `@@unique` no banco de dados

### Infraestrutura de Filas (BullMQ)

```
infra/queue/
├── connection.ts              # Conexão Redis para BullMQ
├── queue-manager.ts           # Singleton: registerQueue, addJob, shutdown
├── types.ts                   # JobProgress, JobResult, JobError, JobStatusResponse
├── job.routes.ts              # GET /api/jobs/:queueName/:jobId
├── job.controller.ts          # Consulta ImportJob no banco
└── workers/
    └── associate-import.worker.ts  # Processamento de importação de associados
```

- `QueueManager` — classe singleton para registrar filas e workers
- Workers atualizam a tabela `ImportJob` durante e após processamento
- Endpoint genérico de consulta lê da tabela `ImportJob` (persistente)

### Model ImportJob

- `ImportJob` — registro de importações: jobId, queueName, status, totalRows, successCount, errorCount, errors (JSON)
- Pertence a Company (companyId) e registra userId de quem iniciou
- Status: PENDING → PROCESSING → COMPLETED/FAILED
- Tabela genérica — serve para qualquer tipo de importação futura

### Endpoints de Jobs

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/jobs/:queueName/:jobId | Sim | Consultar status de um job |

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

### Endpoints de Plans

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/plans | Sim | Listar planos (paginação, busca, filtro status) |
| GET | /api/plans/:id | Sim | Buscar plano por ID |
| POST | /api/plans | Sim | Criar plano (JSON: name, description?, productIds, discountType?, discountValue?) |
| PUT | /api/plans/:id | Sim | Atualizar plano (JSON: campos opcionais) |
| DELETE | /api/plans/:id | Sim | Excluir plano (soft delete) |

### Endpoints de Billings

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/billings | Sim | Listar cobranças (paginação, busca por nome associado, filtros status/type) |
| GET | /api/billings/:id | Sim | Buscar cobrança por ID (inclui dados do associado) |
| POST | /api/billings | Sim | Criar cobrança (associateId, type, origin, planId?, productIds?, discount?, description, dueDate, value, subtotal) |
| PUT | /api/billings/:id | Sim | Atualizar cobrança (status, description, dueDate) |
| DELETE | /api/billings/:id | Sim | Cancelar cobrança (soft delete + status CANCELLED) |
| GET | /api/billings/search-associates?search= | Sim | Buscar associados ativos por nome ou CPF (min 2 chars, max 10 resultados) |

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
│   ├── ProductsSection.tsx      # Seção de produtos (CRUD + toggle status + upload imagem)
│   └── PlansSection.tsx         # Seção de planos (CRUD + toggle status + seleção de produtos + desconto)
├── hooks/
│   ├── useSettings.ts           # Hooks React Query (useCompanyInfo, useUpdateCompanyInfo)
│   ├── useRoles.ts              # Hooks React Query (useRoles, useCreateRole, useUpdateRole, useDeleteRole)
│   ├── usePermissions.ts        # Hooks React Query (usePermissions, useUpdatePermissions)
│   ├── useProducts.ts           # Hooks React Query (useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useRemoveProductImage)
│   └── usePlans.ts              # Hooks React Query (usePlans, useCreatePlan, useUpdatePlan, useDeletePlan)
└── services/
    ├── settingsService.ts       # API service (company info)
    ├── roleService.ts           # API service (roles CRUD)
    ├── permissionService.ts     # API service (permissions GET/PUT by roleId)
    ├── productService.ts        # API service (products CRUD + upload/remove image)
    └── planService.ts           # API service (plans CRUD)
```

**Seções implementadas:**
- **Informações da Empresa** — nome, nome fantasia, CNPJ, departamento, email, telefone, endereço (rua, bairro, cidade, estado, CEP)
- **Setores** — CRUD de setores com toggle de status (ativo/inativo), edição de nome, exclusão com confirmação
- **Permissões** — Grid de permissões por setor (módulos x ações com checkboxes), select de setor, salvar permissões

- **Produtos** — CRUD de produtos com nome, descrição, valor (R$), imagem (upload), toggle de status (ativo/inativo), exclusão com confirmação
- **Planos** — CRUD de planos que agrupam produtos, com desconto (% ou R$), preview de valor final em tempo real, toggle de status, exclusão com confirmação

### Módulo Associates (Associados)

**Estrutura:**
```
modules/associates/
├── pages/
│   ├── AssociatesPage.tsx         # Listagem de associados
│   └── AssociateDetailPage.tsx    # Página de detalhe do associado
├── components/
│   ├── AssociatesHeader.tsx       # Header com busca, filtros, botão criar e barra de progresso
│   ├── AssociatesTable.tsx        # Tabela/listagem de associados (clique no nome navega para detalhe)
│   ├── AssociateForm.tsx          # Formulário de criação/edição
│   └── ImportSpreadsheetModal.tsx # Modal de importação de associados via planilha
├── hooks/
│   └── useAssociates.ts           # Hooks React Query (useAssociates, useAssociate, useCreate/Update/Delete/Import)
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

### Módulo Billings (Cobranças)

**Estrutura:**
```
modules/billings/
├── pages/
│   └── BillingsPage.tsx            # Listagem de cobranças com cards, filtros, busca
├── components/
│   ├── BillingsList.tsx            # Grid de cards com dados da cobrança + menu de ações
│   └── CreateBillingModal.tsx      # Modal com fluxo progressivo (associado → tipo → origem → seleção → resumo)
├── hooks/
│   └── useBillings.ts             # Hooks React Query (useBillings, useCreate/Update/Delete, useSearchAssociates)
└── services/
    └── billingService.ts          # API service (CRUD + searchAssociates)
```

**Fluxo de criação:**
1. Buscar associado por nome/CPF (dropdown com resultados)
2. Selecionar tipo: Assinatura ou Cobrança Avulsa
3. Selecionar origem: Plano ou Produto Avulso
4. Selecionar plano (radio) ou produtos (checkboxes)
5. Resumo: subtotal automático, desconto adicional (% ou R$), valor final, descrição editável, data de vencimento

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
- **Cobranças** — botão criar condicionado por `create`, editar e cancelar condicionados por `edit`/`delete`

### Componentes Compartilhados Extras

- **SpreadsheetReader** (`shared/components/SpreadsheetReader/`) — componente genérico de leitura de planilhas. Drag & drop, parse com SheetJS (xlsx), mapeamento de colunas (case-insensitive + aliases), preview em tabela, download de planilha modelo
- **JobProgressBar** (`shared/components/JobProgressBar/`) — barra de progresso reutilizável para jobs assíncronos. Polling via React Query, atualiza store Zustand, auto-dismiss após conclusão

### Stores Compartilhadas (shared/stores/)

- `useJobProgressStore` — Store Zustand com persistência em localStorage. Rastreia jobs assíncronos (importações). Sobrevive a F5 e navegação entre páginas

### Hooks Compartilhados (shared/hooks/)

- `useMyPermissions()` / `useCanAccess(module, action)` — sistema de permissões (ver seção acima)
- `useToast()` — exibir toasts de feedback (success, danger, warning)
- `useCepSearch()` — busca de endereço por CEP com 4 sistemas de fallback (BrasilAPI → OpenCEP → AwesomeAPI → ViaCEP). Retorna `{ fetchAddress, isLoading }`. Usado em CompanyInfoSection e LoginPage
- `useJobStatus(queueName, jobId, enabled)` — polling de status de job via React Query (1s). Para automaticamente quando completed/failed
