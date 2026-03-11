# Arquitetura do Frontend (React + Vite)

Este documento detalha a arquitetura do frontend da aplicação **AprovaAI**, focando nas recentes melhorias estruturais: a adoção da **Camada de Serviço (Service Layer)** e a centralização de **Rotas**.

---

## 1. Visão Geral

O frontend foi construído utilizando **React** com **Vite**, priorizando performance e uma estrutura modular. A comunicação com o backend (NestJS) é feita através de uma instância configurada do **Axios**.

### Principais Tecnologias
- **React 18**
- **Vite**
- **TypeScript**
- **TailwindCSS**
- **Axios**
- **React Router DOM**
- **React Hook Form** + **Zod** (para formulários e validação)

---

## 2. Camada de Serviço (Service Layer)

Para desacoplar a lógica de UI (componentes React) da lógica de comunicação com a API, adotamos o padrão de **Service Layer**.

### Estrutura
Todos os serviços ficam localizados em `src/services/`.

- **`api.ts`**: Arquivo central de configuração.
  - Cria a instância do Axios com a `baseURL`.
  - Configura **interceptors** para anexar automaticamente o token JWT (`Authorization: Bearer ...`) em todas as requisições.
  - Trata erros globais de resposta (opcional).

- **`*.service.ts`**: Arquivos específicos para cada entidade (ex: `exams.service.ts`, `topics.service.ts`).
  - Cada arquivo exporta um objeto ou classe com métodos estáticos para interagir com os endpoints da API.
  - Define e exporta as **Interfaces/Tipos** (DTOs) relacionados àquela entidade.

### Exemplo de Uso

**Definição (`src/services/exams.service.ts`):**
```typescript
import api from './api';

export interface Exam {
  id: string;
  name: string;
  // ...
}

export const examsService = {
  findAll: async () => {
    const response = await api.get<Exam[]>('/exams');
    return response.data;
  },
  create: async (data: CreateExamDTO) => {
    const response = await api.post('/exams', data);
    return response.data;
  },
  // ...
};
```

**Consumo no Componente:**
```typescript
import { examsService } from '@/services/exams.service';

function ExamList() {
  useEffect(() => {
    const load = async () => {
      const data = await examsService.findAll();
      setExams(data);
    };
    load();
  }, []);
}
```

### Benefícios
1.  **Reutilização:** A mesma chamada de API pode ser usada em várias páginas.
2.  **Manutenção:** Se um endpoint mudar, alteramos apenas no serviço, não em todos os componentes.
3.  **Testabilidade:** Facilita a criação de mocks para testes unitários.
4.  **Organização:** Remove a lógica de `axios.get/post` de dentro do `useEffect` dos componentes.

---

## 3. Roteamento (Routing)

O roteamento da aplicação foi centralizado para facilitar a gestão de rotas públicas e privadas (protegidas).

### Estrutura
- **`src/routes/index.tsx`**: Contém o componente `AppRoutes`, que define todas as rotas da aplicação.
- **`src/App.tsx`**: Importa e renderiza o `AppRoutes` dentro dos provedores de contexto (`AuthProvider`, `Router`, etc.).

### Definição de Rotas
As rotas são definidas utilizando o `react-router-dom`. Rotas que exigem autenticação ou permissões específicas (como Admin) são envolvidas por componentes de Layout ou Guards (como `AuthLayout` ou verificação de role no `Sidebar`).

**Exemplo (`src/routes/index.tsx`):**
```typescript
export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Rotas Protegidas (Dashboard) */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="exams" element={<AdminExams />} />
        {/* ... */}
      </Route>
    </Routes>
  );
}
```

### Navegação
Utilizamos o hook `useNavigate` do `react-router-dom` para navegação programática e o componente `<Link>` ou `<NavLink>` para links na interface.

---

## 4. Estrutura de Diretórios Recomendada

```
frontend/src/
├── components/       # Componentes reutilizáveis (UI, Layouts)
│   ├── ui/           # Componentes base (Button, Input, Modal)
│   └── layout/       # Estruturas de página (Sidebar, Header)
├── context/          # Contextos globais (AuthContext)
├── hooks/            # Custom Hooks (useToast, useFormValidation)
├── pages/            # Componentes de Página (vistas principais)
│   ├── dashboard/    # Páginas da área logada
│   └── ...
├── routes/           # Configuração de rotas (AppRoutes)
├── services/         # Comunicação com API (Axios + Services)
├── types/            # Tipos globais (se necessário)
└── App.tsx           # Ponto de entrada principal
```
