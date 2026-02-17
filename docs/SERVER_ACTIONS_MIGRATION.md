<- [Voltar para README.md](../README.md)

# Migração para Server Actions

## Introdução

Este documento detalha a refatoração da camada de API do projeto AprovaAI, migrando de **Route Handlers** (`route.ts`) para **Server Actions** (`use server`). Essa mudança visa melhorar a performance, simplificar o código, garantir maior segurança de tipos e adotar as práticas mais modernas do Next.js 14+.

## O que mudou?

Anteriormente, a comunicação entre o front-end (componentes React) e o banco de dados era feita através de chamadas HTTP (`fetch`) para endpoints de API (`/api/admin/...`).

Agora, utilizamos funções assíncronas que rodam diretamente no servidor, chamadas **Server Actions**, localizadas na pasta `src/actions/`.

### Estrutura de Arquivos

| Antigo (API Routes) | Novo (Server Actions) | Descrição |
| :--- | :--- | :--- |
| `src/app/api/admin/exams/route.ts` | `src/actions/exams.ts` | CRUD de Exames |
| `src/app/api/admin/topics/route.ts` | `src/actions/topics.ts` | CRUD de Tópicos |
| `src/app/api/admin/levels/route.ts` | `src/actions/levels.ts` | CRUD de Níveis |
| `src/app/api/admin/questions/route.ts` | `src/actions/questions.ts` | CRUD de Questões |
| `src/app/api/admin/users/route.ts` | `src/actions/users.ts` | Gestão de Usuários |
| `src/app/api/admin/upload/route.ts` | `src/actions/upload.ts` | Upload de Imagens |
| `src/app/api/register/route.ts` | `src/actions/auth.ts` | Registro e Auth |
| `src/app/api/simulations/.../route.ts` | `src/actions/simulation.ts` | Lógica de Simulados |

## Benefícios da Nova Arquitetura

1.  **Eliminação de Boilerplate:** Não é mais necessário criar objetos `Request` e `Response`, nem fazer parsing manual de JSON.
2.  **Type Safety (Segurança de Tipos):** As funções retornam dados tipados diretamente do Prisma/TypeScript, eliminando a necessidade de interfaces manuais ou `any` no front-end.
3.  **Performance:** Menos overhead de rede, já que não há uma requisição HTTP tradicional para a mesma origem.
4.  **Revalidação Automática:** Uso de `revalidatePath` para atualizar o cache do Next.js automaticamente após mutações (criar/editar/deletar), garantindo que a UI esteja sempre sincronizada.

## Como Usar as Server Actions

### Exemplo: Buscando Dados (Server Component)

```tsx
// Antes (Client Component com useEffect e fetch)
/*
useEffect(() => {
  fetch('/api/admin/exams').then(res => res.json()).then(data => setExams(data));
}, []);
*/

// Agora (Server Action importada diretamente)
import { getExams } from '@/actions/exams';

// Em um Server Component:
const exams = await getExams();

// Em um Client Component (se necessário):
useEffect(() => {
  getExams().then(setExams);
}, []);
```

### Exemplo: Mutações (Formulários)

```tsx
import { createExam } from '@/actions/exams';

const handleSubmit = async (formData) => {
  try {
    await createExam({
      name: formData.name,
      description: formData.description,
      status: 'ACTIVE'
    });
    // Sucesso! A lista de exames será atualizada automaticamente.
  } catch (error) {
    // Tratamento de erro direto (sem precisar ler response.json())
    console.error(error.message);
  }
};
```

## Padrões Adotados

*   **Validação:** Todas as actions utilizam **Zod** para validar os dados de entrada antes de processá-los.
*   **Autenticação:** Todas as actions verificam a sessão do usuário (`getServerSession`) e suas permissões (`role`) antes de executar operações sensíveis.
*   **Tratamento de Erros:** Erros são lançados (`throw new Error`) e devem ser capturados por blocos `try/catch` no front-end.

## Próximos Passos

*   Continuar migrando quaisquer novas funcionalidades para Server Actions.
*   Utilizar `useFormState` e `useFormStatus` para melhorar a experiência de formulários no futuro.

<- [Voltar para README.md](../README.md)