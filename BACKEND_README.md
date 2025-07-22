# AprovaAI - Backend de Autenticação

Este documento descreve a implementação completa do backend de autenticação para a aplicação AprovaAI, incluindo registro de usuários e sistema de login.

## 🏗️ Arquitetura

### Stack Tecnológica
- **Next.js 14** - Framework React com API Routes
- **TypeScript** - Tipagem estática
- **PostgreSQL** - Banco de dados relacional
- **Prisma** - ORM para TypeScript
- **NextAuth.js** - Autenticação e gerenciamento de sessões
- **bcryptjs** - Hash de senhas
- **Zod** - Validação de dados

## 📁 Estrutura de Arquivos

```
src/
├── app/
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts          # Configuração NextAuth.js
│       └── register/
│           └── route.ts              # API de cadastro
├── lib/
│   └── prisma.ts                     # Cliente Prisma singleton
└── types/
    └── next-auth.d.ts                # Tipagens NextAuth customizadas

prisma/
└── schema.prisma                     # Schema do banco de dados

.env.example                          # Variáveis de ambiente
```

## 🗄️ Modelo de Dados

### Tabela `users`

| Campo | Tipo | Descrição |
|-------|------|----------|
| `id` | String (CUID) | Identificador único |
| `full_name` | String | Nome completo do usuário |
| `username` | String (único) | Nome de usuário |
| `date_of_birth` | DateTime | Data de nascimento |
| `email` | String (único) | E-mail do usuário |
| `password_hash` | String | Hash da senha |
| `is_premium` | Boolean | Status premium (padrão: false) |
| `is_admin` | Boolean | Status admin (padrão: false) |
| `created_at` | DateTime | Data de criação |
| `updated_at` | DateTime | Data de atualização |

## 🔐 Autenticação

### NextAuth.js Configuration

- **Estratégia**: JWT (JSON Web Tokens)
- **Provedor**: Credentials (email + senha)
- **Adapter**: PrismaAdapter para persistência
- **Páginas customizadas**: Login em `/login`

### Fluxo de Autenticação

1. **Login**: Usuário fornece email e senha
2. **Verificação**: Sistema busca usuário no banco e compara senha
3. **JWT**: Token JWT é gerado com dados do usuário
4. **Sessão**: Sessão é criada com informações do usuário

## 📡 APIs

### POST `/api/register`

**Descrição**: Cadastra um novo usuário

**Body**:
```json
{
  "fullName": "João Silva",
  "username": "joaosilva",
  "email": "joao@exemplo.com",
  "password": "minhasenha123",
  "dateOfBirth": "1995-05-15"
}
```

**Validações**:
- Nome completo obrigatório
- Username mínimo 3 caracteres
- Email válido
- Senha mínimo 6 caracteres
- Data de nascimento válida
- Email e username únicos

**Respostas**:
- `201`: Usuário criado com sucesso
- `400`: Dados inválidos
- `409`: Email ou username já existe
- `500`: Erro interno

### POST `/api/auth/signin`

**Descrição**: Autentica usuário (NextAuth.js)

**Body**:
```json
{
  "email": "joao@exemplo.com",
  "password": "minhasenha123"
}
```

## 🛠️ Configuração e Instalação

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Banco de Dados com Docker (Recomendado)

#### Iniciar PostgreSQL com Docker Compose
```bash
# Iniciar o banco de dados
docker-compose up -d

# Verificar se está rodando
docker-compose ps
```

#### Parar o banco de dados (quando necessário)
```bash
# Parar sem remover dados
docker-compose stop

# Parar e remover tudo (cuidado: apaga dados!)
docker-compose down -v
```

#### Alternativas sem Docker
- **PostgreSQL Local**: Instale localmente e configure
- **Supabase**: https://supabase.com (gratuito)
- **Railway**: https://railway.app
- **Neon**: https://neon.tech

### 3. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` com suas configurações:
```env
# Database (Docker PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/aprovaai"

# NextAuth.js
NEXTAUTH_SECRET="seu-secret-super-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

> **💡 Dica**: Se usar Docker, a `DATABASE_URL` já está configurada corretamente no `.env.example`

### 4. Configurar Prisma e Banco de Dados

```bash
# 1. Certifique-se que o Docker está rodando
docker-compose up -d

# 2. Gerar o cliente Prisma
npm run db:generate

# 3. Aplicar o schema ao banco de dados
npm run db:push

# 4. (Opcional) Abrir Prisma Studio para visualizar dados
npm run db:studio
```

### 4. Executar Aplicação

```bash
npm run dev
```

O servidor estará disponível em: http://localhost:3000

## 🐳 Desenvolvimento com Docker

### Fluxo Diário de Desenvolvimento

```bash
# 1. Iniciar banco de dados (uma vez por sessão)
docker-compose up -d

# 2. Iniciar desenvolvimento Next.js
npm run dev

# 3. Fazer alterações no código...
# ✅ Hot-reload funciona normalmente!

# 4. Ao finalizar o dia (opcional)
docker-compose stop
```

### Comandos Úteis do Docker

```bash
# Ver logs do PostgreSQL
docker-compose logs postgres

# Acessar o container do PostgreSQL
docker-compose exec postgres psql -U postgres -d aprovaai

# Verificar status dos containers
docker-compose ps

# Reiniciar apenas o banco
docker-compose restart postgres
```

### ⚡ Hot-Reload e Docker

- ✅ **Docker NÃO afeta o hot-reload do Next.js**
- ✅ **Mudanças no código atualizam instantaneamente**
- ✅ **Apenas o banco roda no Docker, o Next.js roda localmente**
- ❌ **Só reinicie o `npm run dev` se mudar `.env` ou `next.config.js`**

## 🔒 Segurança

### Hash de Senhas
- **bcryptjs** com salt rounds = 10
- Senhas nunca são armazenadas em texto plano
- Hash é verificado durante login

### Validação de Dados
- **Zod** para validação de entrada
- Sanitização automática
- Verificação de tipos TypeScript

### Sessões JWT
- Tokens assinados com `NEXTAUTH_SECRET`
- Expiração automática
- Dados sensíveis não expostos

## 🧪 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm run start

# Linting
npm run lint

# Banco de dados
npm run db:generate    # Gerar cliente Prisma
npm run db:push        # Aplicar schema (dev)
npm run db:migrate     # Criar migração
npm run db:studio      # Interface visual do banco
```

## 🚀 Deploy

### Variáveis de Ambiente (Produção)

1. **DATABASE_URL**: String de conexão PostgreSQL
2. **NEXTAUTH_SECRET**: Chave secreta forte (32+ caracteres)
3. **NEXTAUTH_URL**: URL da aplicação em produção

### Checklist de Deploy

- [ ] Configurar banco PostgreSQL
- [ ] Definir variáveis de ambiente
- [ ] Executar migrações: `npx prisma migrate deploy`
- [ ] Gerar cliente: `npx prisma generate`
- [ ] Build da aplicação: `npm run build`

## 🔍 Troubleshooting

### Erro de Conexão com Banco
- Verificar `DATABASE_URL`
- Confirmar que PostgreSQL está rodando
- Testar conectividade

### Erro de Autenticação
- Verificar `NEXTAUTH_SECRET`
- Confirmar configuração de domínio
- Checar logs do NextAuth (debug: true)

### Erro de Migração
- Verificar schema Prisma
- Executar `prisma db push` em desenvolvimento
- Usar `prisma migrate reset` se necessário

## 📚 Recursos Adicionais

- [Documentação Prisma](https://www.prisma.io/docs/)
- [Documentação NextAuth.js](https://next-auth.js.org/)
- [Documentação Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)