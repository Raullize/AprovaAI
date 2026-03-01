<h1 align="center">AprovaAI — Backend</h1>

<p align="center">
  <img src="http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white"/>
</p>

> API REST do AprovaAI — plataforma de estudos gamificada para preparação de exames.

---

## Descrição

O backend do AprovaAI é uma API REST construída com **Node.js + NestJS + TypeScript**, utilizando **Prisma ORM** para acesso ao banco de dados **PostgreSQL**. Fornece endpoints para autenticação, gerenciamento de conteúdo (exames, tópicos, níveis, questões) e upload de imagens.

---

## Tecnologias

| Tecnologia | Versão | Função |
|---|---|---|
| Node.js | 18+ | Runtime JavaScript |
| TypeScript | 5 | Tipagem estática |
| NestJS | 11 | Framework opinado e escalável |
| Prisma | 5.22 | ORM e migrações |
| PostgreSQL | 15+ | Banco de dados relacional |
| JWT (`@nestjs/jwt`) | 11 | Autenticação stateless |
| Zod | 4 | Validação de schemas via Pipes |
| Multer | 2 | Upload de arquivos locamente encapsulado |
| Docker / Compose | — | Containerização do banco |

---

## Pré-requisitos

- Node.js 18+
- npm 9+
- Docker e Docker Compose (para subir o PostgreSQL)
- Git

---

## Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/Raullize/AprovaAI.git
cd AprovaAI/backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais (veja [Variáveis de Ambiente](#variáveis-de-ambiente)).

### 4. Suba o banco de dados PostgreSQL via Docker

A partir da raiz do projeto (`cd ..`), inicie o ambiente com o container do banco de dados em background:

```bash
docker-compose up -d postgres
```

> **Nota:** Não utilize apenas `docker-compose up -d` neste momento, pois a intenção é subir apenas o banco de dados e rodar a API localmente na sua máquina para receber os comandos do Prisma.

### 5. Aplique o schema ao banco de dados

O Docker apenas criou o banco de dados vazio. Precisamos criar as tabelas com o Prisma. De volta à pasta `backend`, sincronize o banco e gere os tipos para o TypeScript:

```bash
npx prisma db push
npx prisma generate
```

### 6. (Opcional) Popule o banco com dados iniciais

```bash
npm run db:seed
```

Isso criará:
- Usuário administrador: `admin@aprovaai.com` / `admin123`
- Usuário demo: `demo@aprovaai.com` / `demo123`

### 7. Inicie o servidor de desenvolvimento


Usando o CLI do NestJS nativo para iniciar o servidor com recarregamento a quente:

```bash
npm run start:dev
```

O servidor estará disponível em [http://localhost:3001](http://localhost:3001).

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz de `backend/` baseado no `.env.example`:

| Variável | Exemplo | Descrição |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:password@localhost:5432/aprovaai` | Connection string do PostgreSQL |
| `NODE_ENV` | `development` | Ambiente (`development` / `production`) |
| `PORT` | `3001` | Porta HTTP do servidor |
| `JWT_SECRET` | `your-secret-key` | Chave secreta para assinar tokens JWT |
| `UPLOAD_DIR` | `./uploads` | Diretório de armazenamento de imagens |

---

## Scripts Disponíveis

```bash
npm run start:dev   # Servidor de desenvolvimento interativo com SWC
npm run build       # Compilação TypeScript para a pasta /dist
npm run start:prod  # Inicia o servidor compilado otimizado para produção
npm run format      # Executa o Prettier formatando o código
npm run lint        # Analisador sintático ESLint
```

Comandos do Prisma auxiliam no dia a dia:
```bash
npx prisma db push     # Aplica mudanças diretas de schema para o banco dev
npx prisma generate    # Cria/Atualiza tipagens TypeScript em node_modules/@prisma/client
npx prisma studio      # Interface gráfica localhost para gerenciar tabelas e registros
```

---

## Estrutura de Pastas

Diferente do Express comum, o NestJS divide tudo verticalmente por Feature (Módulos):

```
backend/
├── prisma/
│   ├── schema.prisma   # Modelos do banco de dados (Tabelas)
│   └── seed.ts         # Script de população inicial (seed db)
├── uploads/            # Imagens salvas isoladas via filesystem
└── src/
    ├── app.module.ts   # Ponto de inicialização global do ecossistema Nest
    ├── auth/           # Módulo, Serviços e Rotas (JWT/Decorators de Admin)
    ├── exams/          # CRUD do Exame + PATCH (Drag n Drop)
    ├── topics/         # CRUD de Tópicos
    ├── levels/         # CRUD de Níveis
    ├── questions/      # CRUD de Questões e Alternativas
    ├── upload/         # Controller de Upload via Interceptor local
    └── utils/          # Helpers (Zod validation pipes, Utils)
```

---

## Endpoints Principais

A API é estaticamente gerida por Controlles injetáveis:

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/auth/login` | Autenticação e geração de JWT |
| `POST` | `/api/auth/register` | Cadastro de usuário |
| `GET` | `/api/exams` | Lista todos os exames |
| `PATCH` | `/api/exams/reorder` | Reordena exames (drag & drop) |
| `GET` | `/api/topics?examId=:id` | Lista tópicos de um exame |
| `PATCH` | `/api/topics/reorder` | Reordena tópicos |
| `GET` | `/api/levels?topicId=:id` | Lista níveis de um tópico |
| `PATCH` | `/api/levels/reorder` | Reordena níveis |
| `GET` | `/api/questions?levelId=:id` | Lista questões de um nível |
| `PATCH` | `/api/questions/reorder` | Reordena questões |
| `POST` | `/api/upload` | Upload local de imagem gerenciado pelo Nest |

> Para documentação exploratória extra, importe a coleção existente na raiz do monorepo em `docs/insomnia/`.

---

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request
