# Axion Backend

REST API for the Axion CRM system.

## Technologies

- **Node.js + Fastify** - Fast web framework
- **TypeScript** - Static typing
- **Prisma ORM** - Type-safe ORM
- **PostgreSQL** - Database
- **Redis** - Cache
- **Zod** - Schema validation

## Structure

```
src/
├── modules/           # Application modules
│   ├── associates/    # Associates CRUD
│   ├── contracts/     # Contracts CRUD
│   └── finance/       # Billings and finance
├── shared/            # Shared code
│   ├── middlewares/   # Middlewares (error handler, auth)
│   ├── utils/         # Utility functions
│   └── errors/        # Error classes
├── infra/             # Infrastructure
│   ├── database/      # Prisma client
│   ├── cache/         # Redis
│   └── http/          # HTTP configurations
├── config/            # Configuration (env)
└── app.ts             # Entry point
```

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

### 3. Start database (Docker)

```bash
docker-compose up -d
```

Or if you already have PostgreSQL and Redis installed, configure the URLs in `.env`.

### 4. Run migrations

```bash
npm run db:migrate
```

### 5. Generate Prisma Client

```bash
npm run db:generate
```

### 6. Seed (sample data)

```bash
npm run db:seed
```

### 7. Run in development

```bash
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server in development mode |
| `npm run build` | Compile TypeScript |
| `npm start` | Start compiled server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Populate database with sample data |

## API Endpoints

### Associates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/associates` | List associates |
| GET | `/api/associates/:id` | Get by ID |
| POST | `/api/associates` | Create associate |
| PUT | `/api/associates/:id` | Update associate |
| DELETE | `/api/associates/:id` | Delete associate |

### Query Params (GET /api/associates)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page |
| limit | number | 20 | Items per page |
| search | string | - | Search by name, email or CPF |
| status | string | - | Filter by status (ACTIVE, INACTIVE, PENDING) |
| orderBy | string | createdAt | Sort field |
| order | string | desc | Direction (asc, desc) |

## Request Example

### Create Associate

```bash
curl -X POST http://localhost:3333/api/associates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "cpf": "123.456.789-00",
    "email": "joao@email.com",
    "phone": "(31) 99999-8888"
  }'
```
