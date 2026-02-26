<h1 align="center">AprovaAI — Backend</h1>

<p align="center">
  <img src="http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white"/>
</p>

> API REST do AprovaAI — plataforma de estudos gamificada para preparação de exames.

---

## Descrição

O backend do AprovaAI é uma API REST construída com **Node.js + Express + TypeScript**, utilizando **Prisma ORM** para acesso ao banco de dados **PostgreSQL**. Fornece endpoints para autenticação, gerenciamento de conteúdo (exames, tópicos, níveis, questões) e upload de imagens.

---

## Tecnologias

| Tecnologia | Versão | Função |
|---|---|---|
| Node.js | 18+ | Runtime JavaScript |
| TypeScript | 5 | Tipagem estática |
| Express | 4 | Framework HTTP |
| Prisma | 6 | ORM e migrações |
| PostgreSQL | 15+ | Banco de dados relacional |
| JWT (jsonwebtoken) | — | Autenticação stateless |
| Zod | 3 | Validação de schemas |
| Multer | — | Upload de arquivos |
| Docker / Docker Compose | — | Containerização do banco |

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

```bash
docker-compose up -d
```

> Se não tiver Docker, crie manualmente um banco PostgreSQL e ajuste a `DATABASE_URL` no `.env`.

### 5. Aplique o schema ao banco de dados

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

```bash
npm run dev
```

O servidor estará disponível em [http://localhost:3001](http://localhost:3001).

**Health Check:** [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz de `backend/` baseado no `.env.example`:

| Variável | Exemplo | Descrição |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres123@localhost:5432/aprovaai` | Connection string do PostgreSQL |
| `NODE_ENV` | `development` | Ambiente (`development` / `production`) |
| `PORT` | `3001` | Porta HTTP do servidor |
| `JWT_SECRET` | `your-secret-key` | Chave secreta para assinar tokens JWT |
| `UPLOAD_DIR` | `./uploads` | Diretório de armazenamento de imagens |

---

## Scripts Disponíveis

```bash
npm run dev         # Servidor de desenvolvimento com ts-node-dev
npm run build       # Compilação TypeScript para /dist
npm run start       # Inicia o servidor compilado (produção)
npm run db:push     # Aplica o schema do Prisma ao banco
npm run db:generate # Regenera o Prisma Client
npm run db:studio   # Abre o Prisma Studio (visualizador de dados)
npm run db:seed     # Popula o banco com dados iniciais
```

---

## Estrutura de Pastas

```
backend/
├── prisma/
│   ├── schema.prisma   # Modelos do banco de dados
│   └── seed.ts         # Script de população inicial
├── uploads/            # Imagens enviadas pelos usuários
└── src/
    ├── config/
    │   └── prisma.ts   # Instância do PrismaClient
    ├── controllers/    # Lógica de negócio por entidade
    ├── middlewares/    # Auth (JWT), validações, upload
    ├── routes/         # Definição dos endpoints REST
    ├── utils/          # Slugify e helpers
    └── app.ts          # Configuração Express e middlewares globais
```

---

## Endpoints Principais

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
| `POST` | `/api/upload` | Upload de imagem |

> Para documentação completa, importe a coleção Insomnia em `docs/insomnia/`.

---

## Docker

O arquivo `docker-compose.yml` na raiz do projeto sobe um container PostgreSQL local:

```bash
docker-compose up -d    # Sobe o banco em background
docker-compose down     # Para e remove os containers
```

---

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request
