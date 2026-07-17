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
As rotas são definidas utilizando o `react-router-dom`. Rotas que exigem autenticação ou permissões específicas (como Admin) são envolvidas por componentes de Layout ou Guards (como `PrivateRoute` ou `AdminRoute`).

**Exemplo (`src/routes/index.tsx`):**
```typescript
export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Rotas Protegidas (Dashboard) */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route index element={<DashboardIndex />} />
        <Route path="explore" element={<ExploreExams />} />
        <Route path="explore/:examId" element={<ExamTrail />} />
        <Route path="simulations" element={<SimulationsHistory />} />
        <Route path="simulations/engine/:simulationId" element={<SimulationEngine />} />
        <Route path="simulations/results" element={<SimulationResults />} />
        <Route path="profile" element={<Profile />} />

        <Route path="exams" element={<AdminRoute><AdminExams /></AdminRoute>} />
        <Route path="admin/exams/:examId/topics" element={<AdminRoute><TopicList /></AdminRoute>} />
        <Route path="admin/topics/:topicId/simulations" element={<AdminRoute><SimulationList /></AdminRoute>} />
        <Route path="admin/simulations/:simulationId/questions" element={<AdminRoute><QuestionList /></AdminRoute>} />
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
│   ├── login/        # Login
│   ├── register/     # Registro
│   ├── dashboard/    # Páginas da área logada
│   └── ...
├── routes/           # Configuração de rotas (AppRoutes)
├── services/         # Comunicação com API (Axios + Services)
├── types/            # Tipos globais (se necessário)
└── App.tsx           # Ponto de entrada principal
```

---

## 5. Design Responsivo e Layouts de Tela Larga

A aplicação AprovaAI adota uma estratégia responsiva híbrida projetada para acomodar fluxos focados e fluxos analíticos/gerenciais de alta produtividade.

### 5.1 Largura Focada (`max-w-4xl` / `max-w-md`)
Utilizada em visualizações individuais, configurações e telas de entrada de dados específicas:
- **Telas de Configuração e Perfil** (`ProfileSettings.tsx`, `AdminSettings.tsx`).
- **Modais de Formulário** (`ExamFormModal.tsx`, `QuestionFormModal.tsx`).
- *Objetivo*: Manter o tamanho de linha de leitura confortável e evitar a dispersão visual em formulários.

### 5.2 Largura Expandida (`max-w-[1600px]`)
Utilizada em telas complexas que exigem alta produtividade, grids de múltiplos cartões ou painéis informativos paralelos:
- **Trilha de Exame do Estudante** (`ExamTrail.tsx`): Em telas maiores (desktops e notebooks), o container de até `1600px` permite que o mapa linear e o painel fixo lateral de progresso e estatísticas fiquem posicionados lado a lado de forma harmônica.
- **Painéis de Gerenciamento do Admin** (`AdminExams.tsx`, `TopicList.tsx`, `SimulationList.tsx`, `QuestionList.tsx`): Garante espaço horizontal para visualização em grid de até 4 colunas de cartões, diminuindo a rolagem vertical de conteúdo e dando maior legibilidade às informações gerenciais.

---

## 6. Padrão de Abas (Tab Layout)

Para evitar telas excessivamente verticais e melhorar a navegação do usuário, as páginas de Perfil e Configurações adotam um layout de abas horizontais.

### Páginas com Layout de Abas

- **`Profile.tsx` (Perfil do Estudante)**: Três abas — *Visão Geral* (estatísticas, histórico recente com link "Ver todos"), *Ofensiva* (calendário de streak diário), e *Conquistas* (mural completo de badges com anel de progresso circular SVG).
- **`ProfileSettings.tsx` (Configurações do Estudante)**: Três abas — *Dados Cadastrais* (foto de perfil e formulário em card unificado sem divisores internos), *Alterar Senha*, e *Zona de Perigo* (exclusão de conta).
- **`AdminSettings.tsx` (Configurações do Administrador)**: Duas abas — *Dados Cadastrais* e *Alterar Senha*.

---

## 7. Indicadores de Conteúdo Vazio nos Cards Administrativos

Os cards do painel administrativo exibem alertas visuais automáticos quando uma entidade está **publicada** (`status === 'PUBLISHED'`) mas não possui filhos cadastrados. Este padrão de sinalização passiva garante que o administrador perceba inconsistências de conteúdo sem precisar navegar dentro de cada entidade.

| Card | Condição de Alerta | Mensagem |
|------|-------------------|----------|
| `ExamCard.tsx` | Exame publicado com `topicsCount === 0` | ⚠️ **Sem Tópicos** |
| `TopicCard.tsx` | Tópico publicado com `simulationsCount === 0` | ⚠️ **Sem Simulados** |
| `SimulationCard.tsx` | Simulado publicado com `questionsCount === 0` | ⚠️ **Sem Questões** |

**Comportamento visual:**
- A borda do card assume tonalidade âmbar (`border-amber-300`) com fundo levemente aquecido (`bg-amber-50/5`).
- Um badge pulsante com ícone `AlertTriangle` e texto em maiúsculas aparece ao lado do `StatusBadge` no cabeçalho do card.
- Rascunhos (`DRAFT`) **nunca** exibem o alerta — a sinalização se aplica exclusivamente a itens visíveis aos alunos.

---

## 8. Identidade Visual e Mascote

O mascote oficial da plataforma é o **Prof. Sabichão**, representado pelo arquivo `public/images/prof-sabichao.png`.

Ele substitui o antigo ícone de chapéu de formatura em todos os pontos de identidade da interface:
- **`AuthLayout.tsx`**: Logo centralizado nas telas de login e cadastro.
- **`Sidebar.tsx`**: Logo no topo da barra lateral de navegação.
- **`Header.tsx`**: Logo no cabeçalho mobile.
- **`AppFooter.tsx`**: Logo no rodapé da aplicação.

O mascote é sempre renderizado sobre um fundo branco arredondado (`bg-white rounded-xl shadow-md`) para garantir contraste visual em qualquer contexto de cor.

### Indicadores de Carregamento
- **Páginas e seções**: Spinner circular genérico (`Loading.tsx`) — simples e sem referências visuais ao mascote.
- **Botões de submit** (login/cadastro): Três pontos animados com `animate-bounce` escalonado por `animationDelay`, substituindo o spinner interno do botão para maior clareza contextual.

---

## 9. Responsividade do Ranking Global (`Leaderboard.tsx`)

A tela de Ranking Global e o componente `LeaderboardTable.tsx` foram otimizados para funcionar bem em dispositivos móveis:

- **Barra de ferramentas**: Em mobile, a busca ocupa largura total e os controles de filtro ("Todos/Top 3/Top 10") ficam distribuídos lado a lado com o seletor de paginação (`justify-between`), evitando quebra de linha descontrolada.
- **Tabela responsiva**: Padding das células reduzido em mobile (`py-3 px-2 sm:px-4`). Cabeçalhos de coluna longos são abreviados automaticamente: "Experiência" → "XP" e "Recorde de Ofensiva" → "Ofensiva" em telas menores que `sm`.
- **Eliminação de rolagem dupla**: As páginas `Leaderboard.tsx` e `Profile.tsx` não possuem mais wrappers redundantes de `min-h-screen`, delegando o controle de scroll ao `DashboardLayout.tsx` (container principal do painel).
