<h1 align="center">AprovaAI — Frontend</h1>

<p align="center">
  <img src="http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
</p>

> Interface web do AprovaAI — plataforma de estudos gamificada para preparação de exames.

---

## Descrição

O frontend do AprovaAI é uma Single Page Application construída com **React + Vite + TypeScript**, utilizando **TailwindCSS** para estilização. Consome a API REST do backend para autenticação, gerenciamento de conteúdo e realização de simulados.

---

## Tecnologias

| Tecnologia | Versão | Função |
|---|---|---|
| React | 18 | Biblioteca de UI |
| TypeScript | 5 | Tipagem estática |
| Vite | 5 | Bundler e dev server |
| TailwindCSS | 3 | Estilização utilitária |
| React Router DOM | 6 | Roteamento client-side |
| React Hook Form | 7 | Gerenciamento de formulários |
| Axios | 1 | Cliente HTTP |
| Lucide React | — | Ícones |

---

## Pré-requisitos

- Node.js 18+
- npm 9+
- Backend rodando em `http://localhost:3001` (veja [`/backend`](../backend/README.md))

---

## Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/Raullize/AprovaAI.git
cd AprovaAI/frontend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário.

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173) no navegador.

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz de `frontend/` baseado no `.env.example`:

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3001/api` | URL base da API REST do backend |
| `VITE_NODE_ENV` | `development` | Ambiente de execução |

---

## Scripts Disponíveis

```bash
npm run dev        # Servidor de desenvolvimento com HMR
npm run build      # Build de produção
npm run preview    # Preview da build de produção
npm run lint       # Linting (ESLint)
```

---

## Estrutura de Pastas

```
frontend/
├── public/             # Assets estáticos
└── src/
    ├── components/
    │   └── ui/         # Componentes reutilizáveis (Button, Input, Modal…)
    ├── hooks/          # Custom hooks (useToast, etc.)
    ├── pages/
    │   ├── auth/       # Login, Register
    │   └── dashboard/
    │       ├── admin/  # Gerenciamento: Exames, Tópicos, Níveis, Questões
    │       └── user/   # Área do aluno: Simulados, Perfil, Conquistas
    ├── services/
    │   └── api.ts      # Instância Axios com interceptors JWT
    └── App.tsx         # Roteamento principal
```

---

## Autenticação

Utiliza **JWT** armazenado em `localStorage`. O Axios injeta automaticamente o token em cada requisição via interceptor em `src/services/api.ts`.

---

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request
