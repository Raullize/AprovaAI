<- [Voltar para README.md](../README.md)

# Arquitetura da Aplicação AprovaAI

## Visão Geral

O AprovaAI é uma plataforma de educação construída com tecnologias modernas para garantir performance, escalabilidade e facilidade de manutenção. A aplicação segue uma arquitetura baseada em **Camada de Serviço (Service Layer)** com **Next.js App Router**, permitindo que a mesma lógica de negócio atenda tanto ao frontend web quanto a potenciais clientes externos (Mobile/API).

## Tecnologias Principais

*   **Frontend & Backend:** Next.js 14+ (App Router)
*   **Linguagem:** TypeScript
*   **Banco de Dados:** PostgreSQL
*   **ORM:** Prisma
*   **Autenticação:** NextAuth.js (Auth.js) v4
*   **Estilização:** Tailwind CSS

## Padrão Arquitetural

A aplicação adota um modelo híbrido e desacoplado:

### 1. Camada de Dados (Database & ORM)
*   Gerenciada pelo **Prisma**.
*   Define o schema do banco (`schema.prisma`).
*   Responsável pelas queries brutas e tipagem dos dados.

### 2. Camada de Serviço (`src/actions/`)
*   Aqui reside toda a **Lógica de Negócio**.
*   São funções puras TypeScript (Server Actions).
*   **Responsabilidades:**
    *   Validação de dados (Zod).
    *   Verificação de permissões (Auth).
    *   Chamadas ao Prisma.
    *   Tratamento de erros.
*   **Benefício:** Esta camada é agnóstica de quem a chama. Ela não sabe se veio de um clique num botão React ou de uma requisição API REST.

### 3. Camada de Apresentação Web (`src/app/(admin)/...`)
*   Componentes React (Server e Client Components).
*   Consomem a Camada de Serviço diretamente como funções (`import { createExam } from '@/actions/exams'`).
*   **Vantagem:** Zero overhead de rede (chamada interna de função) e tipagem automática (Type Safety total).

### 4. Camada de API REST (`src/app/api/admin/...`)
*   Endpoints HTTP tradicionais (GET, POST, PATCH, DELETE).
*   Atuam como "Wrappers" ou "Controllers".
*   Recebem JSON, chamam a Camada de Serviço e retornam JSON.
*   **Objetivo:** Permitir integração com sistemas externos (Mobile App) e testes via ferramentas como Insomnia/Postman.

---

## Fluxo de Dados

```mermaid
graph TD
    subgraph "Cliente Web (Next.js)"
        UI[Componentes React]
        UI -->|Server Action| Service
    end

    subgraph "Cliente Externo (Insomnia/Mobile)"
        Mobile[App Mobile / Insomnia]
        API[API Route (src/app/api/...)]
        Mobile -->|HTTP JSON| API
        API -->|Chama Função| Service
    end

    subgraph "Core (Backend)"
        Service[Service Layer (src/actions/*.ts)]
        DB[(PostgreSQL)]
        Service -->|Prisma| DB
    end
```

## Autenticação (NextAuth)

A autenticação é baseada em **Sessão via Cookies** (`httpOnly`, seguro), gerenciada pelo NextAuth.js.

*   **Provedor:** Credentials (Email/Senha).
*   **Persistência:** Banco de Dados (Prisma Adapter).
*   **Segurança:** Senhas com hash bcrypt.
*   **Proteção de Rotas:** Middleware (`middleware.ts`) verifica o token em rotas protegidas (`/admin`, `/dashboard`).

### Particularidades do NextAuth em APIs
Por padrão, o NextAuth é otimizado para navegadores, utilizando redirecionamentos (HTTP 302) após login/logout. Isso exige configurações específicas ao consumir a API via clientes HTTP (veja guia de testes).

<- [Voltar para README.md](../README.md)