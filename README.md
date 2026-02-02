<p align="center">
  <img src="frontend/public/axion-logo.png" alt="Axion Logo" width="280" />
</p>

<p align="center">
  <img src="frontend/public/axion-icon.png" alt="Axion Icon" width="48" />
</p>

<p align="center">
  <strong>CRM multi-tenant para gestao de associados, contratos, cobranças e colaboradores.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-beta-yellow" alt="Status" />
  <img src="https://img.shields.io/badge/license-private-red" alt="License" />
</p>

---

## Sobre o Projeto

O **Axion** e um sistema de gestao empresarial (CRM) desenvolvido para que empresas possam gerenciar seus associados, contratos, cobranças e equipe de colaboradores em um unico lugar.

O sistema funciona no modelo **multi-tenant**: cada empresa possui sua conta isolada, e seus dados ficam completamente separados das demais. Ao criar uma conta, voce registra sua empresa e a partir dai pode convidar colaboradores, cadastrar associados e gerenciar todo o fluxo financeiro.

### O que voce pode fazer hoje

- Criar uma conta para sua empresa (com CNPJ, razao social e departamento)
- Fazer login seguro com autenticacao JWT
- Cadastrar, editar, ativar/desativar e excluir **associados** (clientes)
- Cadastrar, editar e gerenciar **colaboradores** (membros da equipe)
- Alterar senha de colaboradores
- Filtrar e buscar registros por nome, email, CPF ou status
- Selecionar multiplos registros para acoes em lote
- Interface responsiva com tema escuro e sidebar colapsavel

### Em desenvolvimento

- Dashboard com metricas e graficos
- Gestao de contratos
- Gestao de cobranças
- Conexoes entre entidades
- Configuracoes da conta
- Cache com Redis

---

## Screenshots

### Tela de Login

A tela de entrada com animacao diagonal e branding da marca.

<p align="center">
  <img src="docs/screenshots/01-login.png" alt="Tela de Login" width="100%" />
</p>

---

### Cadastro — Passo 1: Dados do Usuario

Formulario em duas etapas. Primeiro, as informacoes do usuario: nome, email, senha e confirmacao de senha.

<p align="center">
  <img src="docs/screenshots/02-register-step1.png" alt="Cadastro - Dados do Usuario" width="100%" />
</p>

---

### Cadastro — Passo 2: Dados da Empresa

Segundo passo: razao social, nome fantasia, CNPJ e departamento.

<p align="center">
  <img src="docs/screenshots/03-register-step2.png" alt="Cadastro - Dados da Empresa" width="100%" />
</p>

---

### Pagina de Associados

Listagem dos associados da empresa com tabela, busca, filtros por status e botao de adicionar.

<p align="center">
  <img src="docs/screenshots/04-associates.png" alt="Pagina de Associados" width="100%" />
</p>

---

### Modal de Novo Associado

Formulario de cadastro com campos: nome completo, CPF (formatado automaticamente), email e telefone.

<p align="center">
  <img src="docs/screenshots/05-associate-form.png" alt="Modal Novo Associado" width="100%" />
</p>

---

### Pagina de Colaboradores

Gerenciamento da equipe com listagem, busca e acoes (editar, alterar senha, ativar/desativar).

<p align="center">
  <img src="docs/screenshots/06-collaborators.png" alt="Pagina de Colaboradores" width="100%" />
</p>

---

### Pagina de Cobranças

Modulo em desenvolvimento para gestao de faturas e pagamentos.

<p align="center">
  <img src="docs/screenshots/07-billings.png" alt="Pagina de Cobrancas" width="100%" />
</p>

---

### Sidebar Colapsada

Em telas menores ou ao clicar no toggle, a sidebar colapsa mostrando apenas os icones.

<p align="center">
  <img src="docs/screenshots/08-sidebar-collapsed.png" alt="Sidebar Colapsada" width="100%" />
</p>

---

## Tecnologias Utilizadas

### Backend

| Tecnologia | Versao | Descricao |
|-----------|--------|-----------|
| [Node.js](https://nodejs.org/) | 18+ | Runtime JavaScript |
| [Fastify](https://fastify.dev/) | 4.26 | Framework HTTP rapido e leve |
| [TypeScript](https://www.typescriptlang.org/) | 5.3 | Tipagem estatica |
| [Prisma](https://www.prisma.io/) | 5.10 | ORM para PostgreSQL |
| [PostgreSQL](https://www.postgresql.org/) | 14+ | Banco de dados relacional |
| [Zod](https://zod.dev/) | 3.22 | Validacao de schemas |
| [JWT](https://jwt.io/) | - | Autenticacao via tokens |
| [bcryptjs](https://www.npmjs.com/package/bcryptjs) | 2.4 | Hash de senhas |

### Frontend

| Tecnologia | Versao | Descricao |
|-----------|--------|-----------|
| [React](https://react.dev/) | 19.2 | Biblioteca de UI |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Tipagem estatica |
| [Vite](https://vitejs.dev/) | 7.2 | Build tool e dev server |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4 | Framework CSS utility-first |
| [React Router](https://reactrouter.com/) | 7.13 | Roteamento SPA |
| [TanStack React Query](https://tanstack.com/query) | 5.90 | Gerenciamento de estado do servidor |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5.0 | Gerenciamento de estado do cliente |
| [Axios](https://axios-http.com/) | 1.13 | Cliente HTTP |
| [React Hook Form](https://react-hook-form.com/) | 7.71 | Gerenciamento de formularios |
| [Framer Motion](https://www.framer.com/motion/) | 12.29 | Animacoes |
| [GSAP](https://gsap.com/) | 3.14 | Animacoes avancadas |
| [Phosphor Icons](https://phosphoricons.com/) | 2.1 | Biblioteca de icones |
| [HeroUI](https://www.heroui.com/) | 2.8 | Componentes de UI |

---

## Arquitetura

```
axion/
├── backend/               # API REST (Fastify + Prisma)
│   ├── src/
│   │   ├── modules/       # Modulos por dominio (auth, associates, collaborators)
│   │   │   └── [modulo]/
│   │   │       ├── *.controller.ts   # Recebe requests
│   │   │       ├── *.service.ts      # Logica de negocio
│   │   │       ├── *.repository.ts   # Acesso ao banco
│   │   │       ├── *.schema.ts       # Validacao (Zod)
│   │   │       └── *.routes.ts       # Definicao de rotas
│   │   ├── shared/        # Erros, middlewares, utils
│   │   └── infra/         # Banco de dados e cache
│   └── prisma/            # Schema e migrations
│
└── frontend/              # SPA (React + Vite)
    ├── src/
    │   ├── modules/       # Modulos por dominio
    │   │   └── [modulo]/
    │   │       ├── pages/         # Componentes de pagina
    │   │       ├── components/    # Componentes do modulo
    │   │       ├── hooks/         # React Query hooks
    │   │       └── services/      # Chamadas API (Axios)
    │   ├── shared/        # Componentes, hooks e utils reutilizaveis
    │   ├── lib/           # Configuracao (Axios, React Query, Zustand)
    │   └── routes/        # Definicao de rotas
    └── public/            # Assets estaticos
```

### Padrao dos Modulos Backend

```
Request → Controller (valida com Zod) → Service (logica) → Repository (Prisma) → Database
```

### Padrao dos Modulos Frontend

```
Page → usa Hooks (React Query) → chama Services (Axios) → API
Page → renderiza Components (Table, Form, Modal)
```

---

## Como Rodar Localmente

### Prerequisitos

Antes de comecar, voce precisa ter instalado:

- **Node.js** versao 18 ou superior — [Baixar aqui](https://nodejs.org/)
- **PostgreSQL** versao 14 ou superior — [Baixar aqui](https://www.postgresql.org/download/)
- **Git** — [Baixar aqui](https://git-scm.com/downloads)
- **npm** (ja vem com o Node.js)

> **Para quem nao e desenvolvedor:** Node.js e o programa que roda o JavaScript fora do navegador. PostgreSQL e o banco de dados onde ficam as informacoes. Git e a ferramenta para baixar o codigo.

### Passo 1: Clonar o repositorio

Abra o terminal (ou Prompt de Comando no Windows) e execute:

```bash
git clone https://github.com/seu-usuario/axion.git
cd axion
```

### Passo 2: Configurar o Banco de Dados

1. Certifique-se de que o PostgreSQL esta rodando
2. Crie um banco de dados chamado `axion`:

```bash
# No terminal do PostgreSQL (psql)
createdb axion
```

> **Dica:** Se voce usa um app como pgAdmin ou DBeaver, crie o banco por la com o nome `axion`.

### Passo 3: Configurar o Backend

```bash
# Entrar na pasta do backend
cd backend

# Instalar as dependencias
npm install

# Criar o arquivo de configuracao (copie o exemplo abaixo)
```

Crie o arquivo `backend/.env` com o seguinte conteudo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/axion"
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
JWT_SECRET=axion-secret-key
JWT_EXPIRES_IN=7d
```

> **Importante:** Ajuste `postgres:postgres` para seu usuario e senha do PostgreSQL se forem diferentes.

Agora execute as migrations e o seed:

```bash
# Criar as tabelas no banco
npx prisma migrate dev

# Popular o banco com dados de exemplo
npm run db:seed
```

### Passo 4: Configurar o Frontend

```bash
# Voltar para a raiz e entrar na pasta do frontend
cd ../frontend

# Instalar as dependencias
npm install
```

### Passo 5: Iniciar a Aplicacao

Voce precisa de **dois terminais** abertos:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Voce vera: `Server running at http://0.0.0.0:3333`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Voce vera: `Local: http://localhost:5173/`

### Passo 6: Acessar

Abra o navegador em **http://localhost:5173**

Para fazer login com a conta de teste:
- **Email:** `admin@axion.com`
- **Senha:** `123456`

---

## Scripts Disponiveis

### Backend

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Inicia o servidor em modo desenvolvimento (com hot reload) |
| `npm run build` | Compila o TypeScript para JavaScript |
| `npm run start` | Inicia o servidor em modo producao |
| `npm run db:migrate` | Executa as migrations do banco de dados |
| `npm run db:generate` | Gera o client do Prisma |
| `npm run db:studio` | Abre o Prisma Studio (interface visual do banco) |
| `npm run db:seed` | Popula o banco com dados de exemplo |

### Frontend

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a versao de producao |
| `npm run lint` | Verifica o codigo com ESLint |
| `npm run preview` | Pre-visualiza o build de producao |

---

## Estrutura do Banco de Dados

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Company    │────<│    User     │     │  Associate  │>────┐
│             │     │ (colaborador)│     │  (cliente)  │     │
│ companyName │     │ name        │     │ name        │     │
│ tradeName   │     │ email       │     │ cpf         │     │
│ cnpj        │     │ password    │     │ email       │     │
│ department  │     │ active      │     │ phone       │     │
└──────┬──────┘     └─────────────┘     │ status      │     │
       │                                └──────┬──────┘     │
       │                                       │            │
       │            ┌─────────────┐     ┌──────┴──────┐     │
       └───────────<│  Contract   │────<│   Billing   │>────┘
                    │ number      │     │ description │
                    │ value       │     │ value       │
                    │ startDate   │     │ dueDate     │
                    │ endDate     │     │ paymentDate │
                    │ status      │     │ status      │
                    └─────────────┘     └─────────────┘
```

**Legenda:** `────<` = relacao "tem muitos" (um Company tem muitos Users, etc.)

### Status possiveis

| Entidade | Status |
|----------|--------|
| Associado | `ACTIVE` (Ativo), `INACTIVE` (Inativo), `PENDING` (Pendente) |
| Contrato | `ACTIVE`, `ENDED`, `CANCELLED`, `PENDING` |
| Cobranca | `PENDING`, `PAID` (Pago), `OVERDUE` (Atrasado), `CANCELLED` |

---

## API Endpoints

Todos os endpoints (exceto auth e health) requerem o header `Authorization: Bearer <token>`.

### Autenticacao
```
POST   /api/auth/login      # Login (retorna token)
POST   /api/auth/register   # Cadastro de empresa + usuario
POST   /api/auth/refresh    # Renovar token
```

### Associados
```
GET    /api/associates       # Listar (paginado, com busca e filtros)
GET    /api/associates/:id   # Detalhar
POST   /api/associates       # Criar
PUT    /api/associates/:id   # Atualizar
DELETE /api/associates/:id   # Excluir
```

### Colaboradores
```
GET    /api/collaborators       # Listar
GET    /api/collaborators/:id   # Detalhar
POST   /api/collaborators       # Criar
PUT    /api/collaborators/:id   # Atualizar
DELETE /api/collaborators/:id   # Excluir
PATCH  /api/collaborators/:id/password  # Alterar senha
```

### Health Check
```
GET    /health   # Verificar se a API esta online
```

---

## Tema e Design

O Axion utiliza um tema escuro com acentos dourados:

| Token | Cor | Uso |
|-------|-----|-----|
| `app-bg` | `#1E232C` | Fundo principal |
| `app-primary` | `#16171C` | Fundo de containers |
| `app-secondary` | `#E6C284` | Cor de destaque (textos, bordas, botoes) |

**Fonte:** [DM Sans](https://fonts.google.com/specimen/DM+Sans) (Google Fonts)

---

## Contribuindo

1. Crie uma branch a partir de `main`:
   ```bash
   git checkout -b feature/minha-feature
   ```

2. Faca suas alteracoes seguindo os padroes do projeto (veja `.claude/PROJECT_CONTEXT.md` para referencia completa)

3. Teste localmente

4. Abra um Pull Request descrevendo as mudancas

### Padroes importantes

- **Backend:** Controller → Service → Repository
- **Frontend:** Page → Components + Hooks + Services
- **Codigo em ingles**, textos da interface em **portugues**
- Validacao com **Zod** no backend
- Estado do servidor com **React Query**, estado do cliente com **Zustand**

---

<p align="center">
  <sub>Desenvolvido com TypeScript, React e Fastify</sub>
</p>
