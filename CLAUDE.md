# Regras do Projeto Axion

## Regra obrigatória: Manter PROJECT_CONTEXT.md atualizado

Após qualquer alteração que mude o contexto ou os padrões do projeto, você **DEVE** atualizar o arquivo `.claude/PROJECT_CONTEXT.md` para refletir a mudança. Isso inclui:

- Novo módulo, rota, página ou componente criado
- Novo model, enum ou migration no Prisma
- Nova dependência adicionada ao projeto (npm install)
- Mudança em padrões existentes (ex: troca de lib, novo pattern de componente)
- Novo endpoint de API
- Novo hook, service ou utilitário compartilhado
- Mudança em variáveis de ambiente
- Mudança no fluxo de autenticação
- Mudança em design tokens ou tema (cores, fontes)
- Mudança em convenções de nomenclatura
- Feature que sai de "em desenvolvimento" para implementada

**Não** atualize para mudanças triviais como:
- Bug fixes que não alteram a arquitetura
- Ajustes de CSS/posicionamento pontuais
- Alteração de textos/labels

## Idioma

- Código e nomes técnicos em **inglês**
- Textos exibidos ao usuário (labels, mensagens, placeholders) em **português**
- Comentários podem ser em português quando necessário para contexto de negócio

## Padrões de código

- Backend segue o padrão **Controller → Service → Repository** por módulo
- Frontend segue **Page → Components + Hooks + Services** por módulo
- Componentes reutilizáveis ficam em `shared/components/`
- Hooks reutilizáveis ficam em `shared/hooks/`
- Validação com **Zod** no backend e validação manual nos forms do frontend
- State do servidor via **React Query**, state do cliente via **Zustand**
- Erros de API exibidos via **Toast** (`useToast`)
