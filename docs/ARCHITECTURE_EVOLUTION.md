# Evolucao da Arquitetura: AprovaAI

Este documento narra o historico de refatoracao estrutural pela qual a aplicacao AprovaAI passou ao longo do tempo. A arquitetura evoluiu desde um monolito padrao ate alcancar maturidade em um sistema dividido em dominios, focado em alta testabilidade e separacao de responsabilidades.

## Fases da Evolucao

A evolucao arquitetural ocorreu em quatro fases principais:

### 1. Fase Inicial: Monolito Next.js (Legado)
Originalmente, a aplicacao foi concebida utilizando **Next.js** de maneira unificada (Fullstack):
- **Stack:** Server-Side Rendering e API Routes acoplados no diretorio `/api`.
- **Autenticacao:** NextAuth.js.
- **Banco de Dados:** Prisma ORM conectando diretamente na base de codigo frontend.
- **Desafios:** Maior dificuldade em escalar o backend de forma subjacente as alteracoes do front. Rotas fortemente misturadas com a UI causavam problemas na hora de testar logicas de banco isoladamente e criavam acoplamento excessivo (*vendor lock-in*). A versao original encontra-se restrita na pasta `legacy_nextjs/`.

### 2. Fase Intermediaria: Client-Server Classico (React + Express)
Para solucionar o acoplamento, o projeto foi segmentado adotando o modelo Client-Server isolado.
- **Frontend:** React 18, Vite e TailwindCSS consumindo uma API autonoma.
- **Backend:** Node.js com Express e Prisma.
- **Motivacao:** Extrair a logica de banco e de rotas para assegurar a independencia do aplicativo front-end. Se houvesse bug visual, seria no modulo `frontend/`, se fosse erro de query, seria no modulo `backend/`.
- **Desafios:** Express, sendo um micro-framework descritivo (nao opinado), gerou a necessidade de orquestrar manualmente a injecao de dependencias, middlewares complexos e tratamentos em "catch" vazios repassados em toda acao de banco.

### 3. Fase de Padronizacao: Migracao para NestJS
Para suprimir o problema do *boilerplate* solto do Express, o backend sofreu nova re-escrita adotando ativamente o ecossistema opinado do **NestJS**.
- **Injecao de Dependencias Nativas (DI):** O padrao natural de Modulos/Controllers/Servicos do Nest alavancou o uso sistemico das instancias em singleton (e.g. `PrismaService` sob demanda).
- **Decorators (Guards e Pipes):** Autorizacao mudou de middleware procedural para formacoes polidas como `@Roles(UserRole.ADMIN)` e validacoes Zod embutidas usando `ZodValidationPipe`.
- **Desacoplamento do Cliente:** Com o backend rodando como API REST solida (`/exams`, `/topics`, `/auth`), o Front-end obteve interacao pura em Axios utilizando tokens baseados em `JwtAuthGuard` isolados na maquina cliente.

### 4. Fase de Maturidade (Atual): Clean Architecture & DDD
Embora organizado sob a estrutura de modulos do NestJS, o codigo original persistia com logicas misturadas no escopo do framework. Como nivel final de maturidade, o projeto abracou a **Arquitetura Limpa** unida ao **Domain-Driven Design**.
- Camadas externas (tecnologia pura Web) foram apartadas e centralizadas externamente em rotas (`api/`). 
- Casos de uso receberam isolamento rigido (`application/`). 
- As verdades do negocio passaram a transitar e respirar num ecosistema imutavel chamado de _Aggregates_ protegendo invariantes internas isoladas completamente da camada NestJS ou BD (`domain/`). Pondo o ponto final ao ciclo com repositorios aplicando o padrao de gravacao limpo.

> **Nota Adicional:** Para compreender o reflexo estrutural real desse novo escopo limpo passo-a-passo e sua explicacao tecnica aprofundada baseada nos diagramas, certifique-se de acessar ativamente o documento: **[Documentacao Fundamental de Arquitetura](./ARCHITECTURE.md)** e **[Frontend Architecture](./FRONTEND_ARCHITECTURE.md)**.

### 5. Decisão Estratégica: Clean Architecture vs. Desenvolvimento com IA (Agentic Orchestration)
Durante o desenvolvimento do projeto, uma discussão arquitetural importante foi levantada a respeito do uso da Clean Architecture e DDD em conjunto com a metodologia de **Agentic Orchestration** (Desenvolvimento orquestrado por Agentes de Inteligência Artificial).

- **O Problema (Custo de Tokens e Boilerplate):** Metodologias modernas de desenvolvimento com IA favorecem arquiteturas simplificadas (como Vertical Slices ou uso direto de ORMs nos Services). Isso ocorre porque a Clean Architecture Pura exige muito *boilerplate* — Mappers, Entities, Value Objects, e separação estrita de Use Cases. Cada nova funcionalidade consome milhares de tokens de contexto da IA apenas para manter o purismo arquitetural, o que não é otimizado do ponto de vista de custo e velocidade para startups ou MVPs.
- **A Decisão (O Contexto do TCC):** Reconhecemos que, sob a ótica de *YAGNI (You Aren't Gonna Need It)* e economia de tokens de IA, a arquitetura atual poderia ser considerada exagerada. **No entanto, o projeto foi mantido intencionalmente em uma Clean Architecture Pragmática com DDD.**
- **A Justificativa:** O objetivo final desta aplicação é servir como objeto de estudo e vitrine tecnológica para um **TCC (Trabalho de Conclusão de Curso)**. A qualidade acadêmica, o rigor na separação de responsabilidades (SRP), a proteção do domínio contra infraestrutura (Prisma/NestJS) e a demonstração de conceitos avançados (como In-Memory Repositories para testes ultrarrápidos e Domain Events) têm precedência sobre a otimização de tokens da IA. O código atua como uma demonstração de maestria em Engenharia de Software, provando o domínio prático sobre padrões de design corporativos de alto nível.
