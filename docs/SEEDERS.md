<- [Voltar para README.md](../README.md)

# Documentação dos Seeders

## Introdução

Os Seeders são scripts utilizados para popular o banco de dados com dados iniciais, essenciais para o desenvolvimento e testes da aplicação. No projeto AprovaAI, utilizamos o Prisma para gerenciar o banco de dados e `tsx` para executar os scripts de seed.

## Estrutura de Arquivos

Os arquivos de seed estão localizados em `prisma/seeders/`:

| Arquivo | Descrição |
| :--- | :--- |
| `index.ts` | Ponto de entrada principal. Gerencia a execução de todos os seeders e a limpeza de dados. |
| `adminSeeder.ts` | Cria o usuário administrador padrão. |
| `userSeeder.ts` | Cria um usuário de demonstração padrão. |

## Como Executar

### Popular o Banco de Dados (Seed)

Para rodar os seeders e popular o banco de dados com os dados iniciais, execute o seguinte comando no terminal:

```bash
npm run db:seed
```

Este comando irá:
1. Conectar ao banco de dados via Prisma.
2. Verificar se os usuários padrão já existem.
3. Criar os usuários caso não existam.
4. Exibir logs de sucesso ou erro no console.

### Limpar os Dados (Cleanup)

Para remover os dados criados pelos seeders (útil para resetar o ambiente), execute:

```bash
npm run db:seed:cleanup
```

Este comando irá remover os usuários criados pelos seeders (`admin@aprovaai.com` e `demo@aprovaai.com`).

## Dados Gerados

Ao executar o seed, os seguintes usuários são criados:

### 1. Administrador

*   **Nome:** Administrador Root
*   **Usuário:** `admin`
*   **E-mail:** `admin@aprovaai.com`
*   **Senha:** `admin123`
*   **Role:** `ADMIN`
*   **Plano:** `FREE`

Use estas credenciais para acessar o painel administrativo da aplicação (`/admin`).

### 2. Usuário Demo

*   **Nome:** Usuário Demo
*   **Usuário:** `demo`
*   **E-mail:** `demo@aprovaai.com`
*   **Senha:** `demo123`
*   **Role:** `USER`
*   **Plano:** `FREE`

Use estas credenciais para testar a experiência de um usuário comum na plataforma.

## Desenvolvimento de Novos Seeders

Para adicionar novos dados iniciais (ex: Exames, Tópicos):

1.  Crie um novo arquivo em `prisma/seeders/` (ex: `examSeeder.ts`).
2.  Exporte uma função de seed (ex: `export async function seedExams() { ... }`) e, opcionalmente, uma função de limpeza.
3.  Importe e chame sua nova função no arquivo `prisma/seeders/index.ts` dentro da função `main()` (e a de limpeza em `cleanup()`).

Exemplo:

```typescript
// prisma/seeders/examSeeder.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function seedExams() {
  await prisma.exam.create({
    data: {
      name: 'ENEM',
      slug: 'enem',
      status: 'ACTIVE'
    }
  });
}
```

```typescript
// prisma/seeders/index.ts
import { seedExams } from './examSeeder';

async function main() {
  // ... outros seeds
  await seedExams();
}
```

<- [Voltar para README.md](../README.md)