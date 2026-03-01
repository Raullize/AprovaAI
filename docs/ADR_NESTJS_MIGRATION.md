# Architecture Decision Record (ADR): Migração para NestJS

## Contexto e Evolução

A arquitetura do **AprovaAI** tem evoluído rapidamente para atender aos requisitos de escalabilidade, manutenibilidade e separação de responsabilidades. A evolução estrutural ocorreu em três fases principais:

### 1. FASE INICIAL: Monolito Next.js (Legado)
Originalmente, a aplicação foi concebida utilizando **Next.js** (Server-Side Rendering + API Routes). 
- **Desafios:** As rotas de API ficavam muito acopladas ao frontend, dificultando o isolamento de regras de negócio, testes e a possibilidade de servir os mesmos dados para futuros aplicativos mobile. A autenticação com NextAuth gerava forte dependência do ecossistema Vercel.

### 2. FASE INTERMEDIÁRIA: Separação React + Express
Na transição para separar o Frontend (SPA) do Backend (API REST), optamos inicialmente por adotar **React (Vite) + Node.js (Express)**.
- **Motivação:** A prioridade era extrair a lógica de banco de dados (Prisma) e rotas HTTP para um servidor autônomo, conquistando independência do frontend.
- **Desafios:** O Express, sendo um micro-framework não opinado, exigiu arquitetar manualmente middlewares, controle de rotas, validação de payload (Zod) e injeção de dependências. Com o crescimento rápido de features (Simulados, Tópicos, Gamificação, Uploads), a manutenção desse boilerplate começou a tomar tempo valioso de desenvolvimento.

### 3. FASE ATUAL: Refatoração para NestJS
Logo em seguida à separação em Express, a equipe de engenharia decidiu dar um passo além na maturidade da arquitetura, refatorando a API imediatamente para **NestJS**.

## Decisão

Foi decidido migrar o backend inteiramente do Express para o ecossistema **NestJS**, mantendo o ORM Prisma e o banco de dados PostgreSQL.

## Motivações para usar NestJS

1. **Arquitetura Opinada e Fortemente Tipada (TypeScript):** 
   Diferente do Express, o NestJS impõe um padrão arquitetural baseado em Angular (Módulos, Controllers e Providers/Services). Isso garante que o código escale de forma previsível.

2. **Injeção de Dependências (DI):**
   O NestJS traz um sistema nativo de DI "Out-of-the-Box", facilitando o isolamento de classes (ex: injetar o `PrismaService` apenas onde é necessário) e viabilizando a futura escrita de testes unitários (Mocks).

3. **Facilidades Nativas (Guards e Pipes):**
   - **Autenticação Avançada:** O complexo middleware de autenticação baseado no JWT do Express foi substituído por `JwtAuthGuard`.
   - **RBAC (Role-Based Access Control):** O gerenciamento do nível de Admin virou uma simples anotação declarativa: `@Roles(UserRole.ADMIN)` utilizando _metadata decorators_.
   - **Validação:** A validação do Zod foi injetada nativamente de forma elegante através de _Pipes_ (`ZodValidationPipe`), retirando código verboso e repetitivo de dentro dos Controllers.

4. **Tratamento de Exceções e Interceptors:**
   Os retornos de HTTP e padronização (ex: Uploads com `FileInterceptor` do Multer localizado) passam a ser geridos no ciclo de vida embutido do Nest, dispensando `wrapCatch` manuais.

## Consequências
- **Curva de Aprendizado Inicial:** Houve impacto focado em transcrever a lógica para "o jeito Nest", abstrair classes e recriotipá-las; 
- **Exclusão total da Base Legada:** As pastas `legacy_nextjs` e `backend/` (Express original) foram permanentemente rompidas e sucedidas pela nova pasta `backend/` baseada em NestJS;
- **Limpeza no fluxo:** Os endpoints estão uniformizados, organizados por recurso de negócio (`/exams`, `/topics`, `/auth`, etc). O Front-end agora consome uma API altamente escalável.
