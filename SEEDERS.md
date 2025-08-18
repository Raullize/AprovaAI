# Seeders do AprovaAI

Este diretório contém os seeders organizados para popular o banco de dados com dados iniciais.

## Estrutura

```
seeders/
├── index.ts          # Coordenador principal dos seeders
├── adminSeeder.ts    # Seeder para criar usuário administrador
├── userSeeder.ts     # Seeder para criar usuários demo
└── README.md         # Este arquivo
```

## Como usar

### Executar todos os seeders
```bash
npm run db:seed
```

### Limpar dados dos seeders
```bash
npm run db:seed:cleanup
```

### Executar seeders específicos
```bash
# Apenas o seeder de admin
npx tsx prisma/seeders/adminSeeder.ts

# Apenas o seeder de usuários
npx tsx prisma/seeders/userSeeder.ts
```

## Dados criados

### Administrador
- **Email**: admin@aprovaai.com
- **Senha**: admin123
- **Tipo**: Administrador (isAdmin: true)

### Usuário Demo
- **Email**: demo@aprovaai.com
- **Senha**: demo123
- **Tipo**: Usuário normal (isAdmin: false)

## Adicionando novos seeders

1. Crie um novo arquivo `nomeSeeder.ts`
2. Exporte funções `seedNome()` e `cleanupNome()`
3. Importe e chame no `index.ts`

### Exemplo de novo seeder

```typescript
// userSeeder.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedUsers() {
  // Lógica para criar usuários
}

export async function cleanupUsers() {
  // Lógica para remover usuários
}
```

```typescript
// index.ts
import { seedUsers, cleanupUsers } from './userSeeder';

// Adicionar na função main()
await seedUsers();

// Adicionar na função cleanup()
await cleanupUsers();
```