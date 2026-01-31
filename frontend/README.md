# Frontend CRM Axion

Aplicação frontend do CRM Axion desenvolvida com React + Vite.

## Tecnologias

- **React 18** + **Vite** - Framework e build tool
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Query (TanStack Query)** - Gerenciamento de estado servidor
- **React Hook Form + Zod** - Formulários e validação
- **Zustand** - Estado global
- **React Router DOM** - Roteamento
- **Lucide React** - Ícones

## Estrutura do Projeto

```
src/
├── modules/           # Módulos da aplicação
│   ├── associados/    # Módulo de Associados
│   └── dashboard/     # Módulo de Dashboard
├── shared/            # Componentes e utilitários compartilhados
│   ├── components/    # Componentes reutilizáveis
│   ├── hooks/         # Hooks customizados
│   └── utils/         # Funções utilitárias
├── lib/               # Configurações de bibliotecas
├── routes/            # Configuração de rotas
└── styles/            # Estilos globais
```

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Funcionalidades Implementadas

### Tela de Associados

- ✅ Listagem de associados em tabela
- ✅ Ordenação por colunas (Nome, Status)
- ✅ Filtros por nome/email e status
- ✅ Formatação de CPF e telefone
- ✅ Badges de status
- ✅ Layout responsivo com sidebar e header

## Path Aliases

O projeto utiliza path aliases para facilitar imports:

- `@/` - Aponta para `src/`
- `@modules/` - Aponta para `src/modules/`
- `@shared/` - Aponta para `src/shared/`
- `@lib/` - Aponta para `src/lib/`

## Tema

O tema dark está configurado com as cores do Figma:

- Background: `#1E232C`
- Primary: `#16171C`
- Secondary: `#E6C284`
