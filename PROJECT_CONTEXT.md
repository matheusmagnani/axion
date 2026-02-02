# Axion CRM — Contexto Completo do Projeto

> Documento de referência para desenvolvedores e IAs que forem dar suporte ao projeto.

---

## 1. Visão Geral

**Axion** é um CRM multi-tenant (SaaS) para gerenciar associados, contratos, cobranças e colaboradores. Cada empresa (Company) possui seus dados isolados via `companyId` em todas as tabelas.

**Domínios principais:**
- **Companies** — entidade raiz multi-tenant
- **Associates** — contatos/clientes de negócio (CPF, status)
- **Contracts** — contratos com valor e datas
- **Billings** — cobranças/faturas
- **Users/Collaborators** — membros da equipe

---

## 2. Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Fastify 4 + TypeScript |
| ORM | Prisma 5 (PostgreSQL) |
| Auth | JWT (@fastify/jwt) + bcryptjs |
| Validação | Zod (backend e frontend) |
| Frontend | React 19 + TypeScript + Vite 7 |
| State (server) | TanStack React Query 5 |
| State (client) | Zustand 5 |
| HTTP Client | Axios (com interceptors) |
| Styling | Tailwind CSS 3 (tema escuro) |
| Ícones | Phosphor Icons (principal) + Lucide React |
| Animações | Framer Motion + GSAP |
| UI Components | HeroUI + Radix UI (Checkbox) |

---

## 3. Estrutura de Diretórios

### Backend (`backend/src/`)

```
backend/src/
├── app.ts                              # Entry point Fastify
├── config/
│   └── env.ts                          # Validação de env com Zod
├── infra/
│   ├── cache/redis.ts                  # Redis client (preparado, não ativo)
│   └── database/prisma/
│       ├── client.ts                   # Singleton Prisma
│       └── seed.ts                     # Script de seed
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.schema.ts             # Zod schemas
│   │   └── auth.routes.ts
│   ├── associates/
│   │   ├── associate.controller.ts
│   │   ├── associate.service.ts
│   │   ├── associate.repository.ts
│   │   ├── associate.schema.ts
│   │   └── associate.routes.ts
│   └── collaborators/
│       ├── collaborator.controller.ts
│       ├── collaborator.service.ts
│       ├── collaborator.repository.ts
│       ├── collaborator.schema.ts
│       └── collaborator.routes.ts
└── shared/
    ├── errors/app-error.ts             # AppError, NotFoundError, ConflictError, etc.
    ├── middlewares/
    │   ├── auth.ts                     # Hook JWT global
    │   └── error-handler.ts            # Handler global de erros
    └── utils/formatters.ts             # formatCPF, formatPhone, clean*
```

### Frontend (`frontend/src/`)

```
frontend/src/
├── App.tsx                             # Root com providers
├── main.tsx                            # ReactDOM render
├── lib/
│   ├── axios.ts                        # Axios instance + interceptors
│   ├── react-query.ts                  # QueryClient config
│   └── zustand.ts                      # Store global (scaffold)
├── modules/
│   ├── auth/
│   │   ├── pages/LoginPage.tsx         # Login + Register (2 steps)
│   │   └── services/authService.ts
│   ├── associates/
│   │   ├── pages/AssociatesPage.tsx
│   │   ├── components/
│   │   │   ├── AssociateForm.tsx
│   │   │   ├── AssociatesHeader.tsx
│   │   │   └── AssociatesTable.tsx
│   │   ├── hooks/useAssociates.ts
│   │   └── services/associatesService.ts
│   ├── collaborators/
│   │   ├── pages/CollaboratorsPage.tsx
│   │   ├── components/
│   │   │   ├── CollaboratorForm.tsx
│   │   │   ├── ChangePasswordForm.tsx
│   │   │   └── CollaboratorsTable.tsx
│   │   ├── hooks/useCollaborators.ts
│   │   └── services/collaboratorsService.ts
│   └── billings/
│       └── pages/BillingsPage.tsx
├── routes/AppRoutes.tsx                # Rotas React Router
├── shared/
│   ├── components/
│   │   ├── Badge/StatusBadge.tsx
│   │   ├── Button/Button.tsx
│   │   ├── Layout/ (Layout, Header, Sidebar)
│   │   ├── PageHeader/ (PageHeader + CSS)
│   │   ├── SearchInput/SearchInput.tsx
│   │   ├── Toast/Toast.tsx
│   │   └── ui/ (Input, Modal, Checkbox, MagicBentoCard)
│   ├── hooks/
│   │   ├── useToast.ts                 # Zustand store de toasts
│   │   └── useSort.ts
│   └── utils/
│       ├── cn.ts                       # clsx + tailwind-merge
│       ├── formatters.ts              # formatCPF, formatPhone
│       └── constants.ts
└── styles/globals.css                  # Tailwind + custom scrollbar + DM Sans font
```

---

## 4. Padrão de Módulos (Backend)

Cada módulo segue: **Controller → Service → Repository**

```
Controller  — Recebe request, valida com Zod schema, chama Service, retorna response
Service     — Lógica de negócio, validações de domínio, lança erros customizados
Repository  — Acesso direto ao banco via Prisma (findAll, findById, create, update, delete)
```

**Rotas** são registradas nos arquivos `*.routes.ts` e montadas no `app.ts`.

---

## 5. Database — Prisma Schema

### Models

**Company** (multi-tenant root)
- `id`, `companyName`, `tradeName?`, `cnpj` (unique), `department?`, timestamps
- Has many: users, associates, contracts, billings

**User** (autenticação/colaboradores)
- `id`, `name`, `email` (unique global), `password` (bcrypt), `active`, timestamps
- Belongs to: company

**Associate** (contatos/clientes)
- `id`, `name`, `cpf`, `email`, `phone`, `status` (enum), timestamps
- `@@unique([cpf, companyId])` — CPF único por empresa
- Belongs to: company. Has many: contracts, billings

**Contract**
- `id`, `number` (unique), `description?`, `value` (Decimal 10,2), `startDate`, `endDate?`, `status` (enum), timestamps
- Belongs to: associate, company. Has many: billings

**Billing**
- `id`, `description`, `value` (Decimal 10,2), `dueDate`, `paymentDate?`, `status` (enum), timestamps
- Belongs to: associate, company. Optional: contract

### Enums

| Enum | Valores |
|------|---------|
| AssociateStatus | ACTIVE, INACTIVE, PENDING |
| ContractStatus | ACTIVE, ENDED, CANCELLED, PENDING |
| BillingStatus | PENDING, PAID, OVERDUE, CANCELLED |

---

## 6. Autenticação

- **Login**: `POST /api/auth/login` → valida email/senha → gera JWT `{ userId, companyId }` com expiração de 7 dias
- **Register**: `POST /api/auth/register` → cria Company + User → retorna mensagem de sucesso
- **Refresh**: `POST /api/auth/refresh` (protegido) → renova token
- **Middleware**: Hook global `onRequest` em todas as rotas exceto `/health` e `/api/auth/*`
- **Frontend**: Token armazenado em `localStorage`. Axios interceptor adiciona `Authorization: Bearer` e faz auto-refresh se expira em < 24h. Response 401 → limpa storage e redireciona para `/login`

---

## 7. API — Padrões

### Endpoints

| Módulo | Endpoints |
|--------|----------|
| Auth | `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/refresh` |
| Associates | `GET/POST /api/associates`, `GET/PUT/DELETE /api/associates/:id` |
| Collaborators | `GET/POST /api/collaborators`, `GET/PUT/DELETE /api/collaborators/:id`, `PATCH /api/collaborators/:id/password` |
| Health | `GET /health` (público) |

### Response Formats

**Lista paginada:**
```json
{
  "data": [...],
  "meta": { "total": 50, "page": 1, "limit": 20, "totalPages": 3 }
}
```

**Erro:**
```json
{
  "statusCode": 400,
  "error": "ValidationError",
  "message": "...",
  "issues": [{ "field": "cpf", "message": "CPF inválido" }]
}
```

### Query Params (listas)
- `page` (default 1), `limit` (default 20, max 100)
- `search` — busca em name, email, cpf
- `status` — filtro por enum
- `orderBy` — 'name' | 'createdAt' | 'status'
- `order` — 'asc' | 'desc'

---

## 8. Frontend — Padrões

### Hooks customizados por módulo

Cada módulo expõe hooks React Query:
```ts
useAssociates(params?)       // GET lista
useAssociate(id)             // GET único
useCreateAssociate()         // POST mutation
useUpdateAssociate()         // PUT mutation
useDeleteAssociate()         // DELETE mutation
// Mutations invalidam cache 'associates' automaticamente
```

### Services

Cada módulo tem um `*Service.ts` que encapsula chamadas Axios:
```ts
associatesService.getAll(params)
associatesService.getById(id)
associatesService.create(data)
associatesService.update(id, data)
associatesService.delete(id)
```

### Toast System

Store Zustand (`useToast`). Tipos: `success`, `danger`, `warning`. Auto-remove em 5s.
```ts
const { addToast } = useToast();
addToast('Cadastrado com sucesso!', 'success');
```

### Componentes Compartilhados

| Componente | Descrição |
|-----------|-----------|
| `Input` | Input com ícone, label, erro, toggle senha, botão clear |
| `Modal` | Overlay com backdrop blur, animação scale, optional MagicBento |
| `StatusBadge` | Badge colorido por status (green/red/yellow) |
| `PageHeader` | Título + ícone + busca + filtros + botão adicionar + spotlight effect |
| `Layout/Sidebar` | Sidebar colapsável (< 1280px), ícones Phosphor |
| `Layout/Header` | Banner beta, info do usuário, avatar, dropdown logout |
| `Toast` | Container fixo top-right com Framer Motion |

### Table Pattern

- Grid CSS customizado (não `<table>`)
- Checkbox multi-select com barra de seleção
- Menu de ações via `createPortal` posicionado com `getBoundingClientRect()`
- Paginação com botões anterior/próximo
- States: loading, empty, data

---

## 9. Styling

### Design Tokens (tailwind.config.js)

```js
colors: {
  'app-bg': '#1E232C',       // Background principal
  'app-primary': '#16171C',   // Background containers
  'app-secondary': '#E6C284'  // Accent dourado
}
fontFamily: { sans: ['DM Sans', ...] }
```

### Tema

- **Dark theme** — fundo escuro com acentos dourados
- Status: green-500 (ativo), red-500 (inativo), yellow-500 (pendente)
- Scrollbar customizada (dourada)
- Font: DM Sans (Google Fonts)

---

## 10. Rotas (Frontend)

```
/login              → LoginPage (pública)
/ (Layout)          → Rotas protegidas (PrivateRoute)
  /associates       → AssociatesPage ✅
  /collaborators    → CollaboratorsPage ✅
  /billings         → BillingsPage (placeholder)
  /dashboard        → Placeholder
  /connections      → Placeholder
  /settings         → Placeholder
```

---

## 11. Convenções de Nomenclatura

| Contexto | Padrão | Exemplo |
|---------|--------|---------|
| Arquivos | kebab-case ou PascalCase (.tsx) | `associate.service.ts`, `AssociateForm.tsx` |
| Variáveis/funções | camelCase | `handleSubmit`, `formatCPF` |
| Classes/Types | PascalCase | `AssociateService`, `CreateAssociateInput` |
| Constantes | SCREAMING_SNAKE | `DEPARTMENTS`, `DEFAULT_GLOW_COLOR` |
| Enums DB | SCREAMING_SNAKE | `ACTIVE`, `PENDING` |
| Texto UI | Português | "Cadastrar", "Associados", "Senha" |
| Código/APIs | Inglês | `associate`, `collaborator`, `billing` |

---

## 12. Variáveis de Ambiente

### Backend (`.env`)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/axion
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
JWT_SECRET=axion
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
```

### Frontend (Vite)
```
VITE_API_URL=http://localhost:3333   # default se não definida
```

---

## 13. Scripts

### Backend
```
npm run dev          # tsx watch src/app.ts
npm run build        # tsc
npm run start        # node dist/app.js
npm run db:migrate   # prisma migrate dev
npm run db:generate  # prisma generate
npm run db:studio    # prisma studio
npm run db:seed      # tsx seed.ts
```

### Frontend
```
npm run dev          # vite (porta 5173)
npm run build        # tsc -b && vite build
npm run lint         # eslint
npm run preview      # vite preview
```

---

## 14. Error Handling

### Backend
- `AppError` (base), `NotFoundError` (404), `ValidationError` (400), `UnauthorizedError` (401), `ConflictError` (409)
- ZodError → 400 com `issues[]` detalhados por campo
- Prisma unique constraint → 409
- Global error handler em `error-handler.ts`

### Frontend
- Axios response interceptor extrai `message` do erro
- 401 → limpa localStorage, redireciona para `/login`
- Erros exibidos via Toast (`addToast(message, 'danger')`)
- Validação local nos forms antes do submit

---

## 15. Features em Desenvolvimento

- Dashboard (página placeholder)
- Contratos CRUD (model existe, UI não)
- Cobranças CRUD (model existe, UI placeholder)
- Conexões (placeholder)
- Configurações (placeholder)
- Redis caching (configurado mas não ativo)
- Testes automatizados (não implementados ainda)
- Export/import de dados
- Operações em bulk
