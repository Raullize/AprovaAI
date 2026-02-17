<- [Voltar para README.md](../README.md)

# Migração para Arquitetura Híbrida (Server Actions + API REST)

## Introdução

Este documento detalha a evolução da arquitetura do projeto AprovaAI, que migrou de um modelo puramente baseado em **Route Handlers** (API Routes tradicionais) para uma **Arquitetura Híbrida** moderna.

Essa mudança estratégica visa combinar o melhor dos dois mundos:
1.  **Performance e Type Safety** para o Frontend Web (via Server Actions).
2.  **Interoperabilidade e Testabilidade** para Clientes Externos/Mobile (via API REST).

## O que mudou?

### 1. Camada de Serviço (Service Layer)

Anteriormente, a lógica de negócio (regras, validações, chamadas ao banco) estava acoplada dentro dos arquivos `route.ts`.

Agora, toda a lógica foi extraída para funções puras e reutilizáveis na pasta `src/actions/`. Estas funções são agnósticas de transporte (não sabem se vieram de um form React ou de uma requisição HTTP).

| Arquivo de Ação | Responsabilidade |
| :--- | :--- |
| `src/actions/exams.ts` | CRUD de Exames (Lógica Pura) |
| `src/actions/topics.ts` | CRUD de Tópicos (Lógica Pura) |
| `src/actions/levels.ts` | CRUD de Níveis (Lógica Pura) |
| `...` | Outras entidades |

### 2. Consumo no Frontend (Web)

O Frontend (Next.js App Router) deixou de fazer chamadas `fetch('/api/...')` para consumir dados. Agora, ele importa e executa as Server Actions diretamente.

**Benefícios:**
*   **Zero Network Waterfall:** Não há overhead de requisição HTTP interna.
*   **Type Safety:** O retorno da função é tipado automaticamente pelo TypeScript.
*   **Revalidação Automática:** Uso de `revalidatePath` para atualizar a UI sem recarregar a página.

### 3. API REST (Endpoints Wrappers)

Para manter a compatibilidade com ferramentas de teste (Insomnia) e permitir futuras integrações (App Mobile), recriamos os endpoints REST em `src/app/api/admin/...`.

Estes endpoints funcionam como "Controllers" leves: eles apenas recebem o JSON, chamam a Server Action correspondente e devolvem a resposta.

**Estrutura:**
```typescript
// src/app/api/admin/exams/route.ts
import { NextResponse } from 'next/server';
import { createExam } from '@/actions/exams'; // Reusa a lógica!

export async function POST(request: Request) {
  const body = await request.json();
  const newExam = await createExam(body); // Chama a Action
  return NextResponse.json(newExam);
}
```

## Resumo da Arquitetura

| Característica | Antes (Só API Routes) | Depois (Híbrido) |
| :--- | :--- | :--- |
| **Lógica de Negócio** | Acoplada no `route.ts` | Isolada em `src/actions/` |
| **Frontend Web** | `fetch('/api/...')` (Lento, sem tipos) | `createExam()` (Rápido, tipado) |
| **Mobile/Externo** | `fetch('/api/...')` | `fetch('/api/...')` (Mantido!) |
| **Testes (Insomnia)** | Nativos | Nativos (via rotas `/api`) |

## Conclusão

A arquitetura híbrida prepara o AprovaAI para o futuro, garantindo a melhor experiência possível para o usuário Web (Next.js nativo) sem fechar as portas para outras plataformas (Mobile) ou dificultar o processo de testes e homologação.

<- [Voltar para README.md](../README.md)