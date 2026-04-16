# Refatoração da Arquitetura: AprovaAI

Este documento registra a mudança estrutural pela qual a aplicação **AprovaAI** passou, migrando de uma arquitetura baseada em Next.js para uma abordagem com repositórios e responsabilidades separadas (Frontend em React+Vite e Backend em Express).

---

## Como era antes (Legado)

Na versão inicial (agora movida para a pasta `legacy_nextjs/`), a aplicação foi construída utilizando **Next.js** em um modelo mais unificado (Fullstack):

- **Framework Principal:** Next.js (Server-Side Rendering e Route API).
- **Autenticação:** NextAuth.js.
- **Banco de Dados:** Prisma ORM conectando diretamente na mesma base de código do Next.js.
- **Acoplamento:** As regras de negócio de banco de dados e rotas HTTP ficavam todas dentro do diretório `/api` do Next.js. O frontend e o backend dividiam o mesmo pacote e dependências.

**Desafios da arquitetura antiga:**
- Maior dificuldade em escalar o backend independentemente do frontend.
- Mistura das lógicas de UI e de Banco de Dados.
- Dificuldade de reaproveitamento da API para outras possíveis plataformas (como um app mobile React Native futuro).
- Vendor lock-in com características específicas do ambiente Next/Vercel.

---

## Como ficou (Nova Arquitetura)

A equipe decidiu realizar uma refatoração arquitetural, dividindo a aplicação em dois projetos distintos, adotando o modelo Client-Server clássico com uma **Single Page Application (SPA)** acoplada a uma **API REST Isolada**:

### 1. Backend (Node.js + NestJS + Clean Architecture)
*Nota Histórica: Na transição original saindo do Next.js para o React + Node, construímos o backend inicial em Express, mas logo em seguida decidimos refatorá-lo completamente para o framework NestJS visando escalabilidade. Mais recentemente, o backend foi novamente refatorado para adotar **Clean Architecture** e **Domain-Driven Design (DDD)**.*

- **Papel:** Fornecer e centralizar as regras de negócio de dados de testes, usuários e reordenação.
- **Stack:** Node.js, NestJS, TypeScript, JWT Autônomo (`@nestjs/jwt`), Prisma ORM e Zod para validação fluída na camada de Pipes.
- **Benefícios:** Total controle sobre as rotas, middlewares, e a lógica do banco (PostgreSQL), facilitando testes unitários, upload de arquivos locais (Multer) e manutenção exclusiva do servidor. As regras de negócio agora estão isoladas na camada de Domínio, independentes do framework NestJS ou do ORM Prisma.

> **Para entender a estrutura atual em camadas do backend (Domain, Application, Infrastructure, API), consulte o documento: [Arquitetura do Backend: Clean Architecture & DDD](./CLEAN_ARCHITECTURE_DDD.md).**

### 2. Frontend (React + Vite)
- **Papel:** Renderizar a interface rica para o aluno e o administrador.
- **Stack:** React 18, Vite (para um build extremamente veloz), TailwindCSS e React Router DOM.
- **Autenticação:** O cliente consome um token JWT gerado pelo Node e o anexa fisicamente às requisições do Axios (uso de interceptors).
- **Benefícios:** Aplicação estática e rápida, rodando puramente no lado do cliente. Componentização isolada (React UI) permitindo que o time de Frontend foque somente em usabilidade (UX/UI) e experiência (Drag & Drop, Modais, Toasts).

> **Para mais detalhes sobre a arquitetura do Frontend (Services, Routes, etc.), consulte o documento dedicado: [Frontend Architecture](./FRONTEND_ARCHITECTURE.md).**

---

## Consequências da Mudança

A separação nos trouxe as seguintes melhorias:
1. **Separação de Preocupações (Separation of Concerns):** Se houver um bug de banco de dados, sabemos exatamente que o problema está no `backend/`. Se for um problema visual, está no `frontend/`.
2. **Setup Claro:** O README agora instrui como subir o banco via Docker e plugar o Backend, além de rodar o Vite localmente, refletindo fielmente uma arquitetura de micro-serviços/API-first.
3. **Gerenciamento de Estado Simplificado:** Trocar o `NextAuth` por uma gestão própria de state/contexto e hooks (`AuthContext.tsx`) deu liberdade total para construir perfis, roles (Admin vs. User) de forma agnóstica sem as travas impostas por provedores de terceiros.
4. **Funcionalidades Ricas:** Permitiu implementar perfeitamente o sistema de **Reordenação (Drag & Drop)**, processando o UI de forma otimista localmente e disparando um `PATCH /reorder` para a API apenas para atualizar os estados do Prisma.
