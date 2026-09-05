# Guia do Docker

O AprovaAI utiliza o Docker para facilitar o provisionamento do ambiente de desenvolvimento. O Docker garante que qualquer desenvolvedor possa subir os serviços necessários (como o banco de dados) sem precisar instalar e configurar tudo manualmente na própria máquina.

## Arquivo de Configuração

O arquivo principal que gerencia isso é o `docker-compose.yml`, localizado na raiz do projeto. Ele descreve quais "containers" (serviços isolados) a nossa aplicação precisa. Atualmente, configuramos nele o banco de dados PostgreSQL.

## Fluxo de Desenvolvimento Local

A abordagem recomendada e mais performática para o desenvolvimento local do AprovaAI é **rodar a aplicação nativamente** e deixar o Docker cuidar apenas da **infraestrutura**. 

Para isso, siga exatamente este fluxo:

### Passo 1: Subir o Banco de Dados

```bash
docker compose up -d postgres
```
**O que este comando faz:** 
Sobe apenas o container do banco de dados PostgreSQL. O parâmetro `-d` (detached) diz ao Docker para deixá-lo rodando em segundo plano (background) na porta `5433`. Neste momento, **a sua API (NestJS) ainda não está no ar**, apenas o banco vazio está aguardando conexões.

### Passo 2: Criar as Tabelas

```bash
cd backend
npx prisma db push
# ou pnpm prisma db push
```
**O que este comando faz:** 
Lê o arquivo `schema.prisma` e cria as tabelas, colunas e relacionamentos dentro desse banco de dados PostgreSQL que acabou de subir no Docker.

### Passo 3: Iniciar a Aplicação

```bash
cd backend
pnpm run start:dev
```
**O que este comando faz:** 
Esse é o comando que efetivamente sobe o seu backend (a API NestJS) nativamente na sua máquina local (porta `3001`). Como a aplicação subiu, ela vai procurar a URL do banco (definida no arquivo `.env`) e se conectar ao PostgreSQL que o Docker está gerenciando.

---

## Ambiente de Testes Funcionais Isolado

Para rodar os testes end-to-end sem correr o risco de apagar ou poluir sua base de desenvolvimento local, o AprovaAI utiliza um **compose separado** (`docker-compose.test.yml`) com um banco PostgreSQL exclusivo para testes funcionais.

### Passo a Passo (Banco de Teste)

#### 1. Subir o container

Na **raiz do projeto**:

```bash
docker compose -f docker-compose.test.yml up -d db_test
```

Este serviço (`db_test`, container `aprovaai_postgres_test`) utiliza a **porta externa `5434`** para não conflitar com o banco de desenvolvimento (que usa a porta `5433`). A URL de conexão padrão é:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/aprovaai_test
```

#### 2. Sincronizar schema do Prisma no banco de teste

```bash
cd backend
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/aprovaai_test" pnpm prisma db push
```

#### 3. Iniciar backend apontando para banco de teste

Copie o arquivo de exemplo e ajuste seu `.env.test` (ou exporte variáveis antes do start):

```bash
cd backend
cp .env.test.example .env.test
pnpm start:dev
```

A API vai escutar em `http://localhost:3001` e responder ao healthcheck em `/api/health`.

#### 4. Rodar os testes E2E

Veja detalhes em [`docs/TESTS.md`](file:///home/raullize/Projects/AprovaAI/docs/TESTS.md). O script principal é:

```bash
cd backend
pnpm test:func
```

Ele espera a API ficar pronta, roda `seed.ts`, executa Jest com `test/jest-e2e.json`, e roda `rollback.ts` no bloco `finally` — garantindo que o banco nunca fica sujo entre execuções.

#### 5. Parar / Resetar o banco de testes

```bash
# Parar (mantém dados do volume)
docker compose -f docker-compose.test.yml stop

# Derrubar container APAGANDO dados (volume)
docker compose -f docker-compose.test.yml down -v
```

---

## Dicas Úteis

* **Derrubar os serviços:** Quando terminar de trabalhar, você pode parar o banco de dados executando `docker compose stop` ou `docker compose down` (o `down` remove os containers).
* **Resetar o banco:** Se precisar limpar tudo, pode rodar `docker compose down -v` para destruir o container e os volumes de dados. Depois, é só seguir o Passo 1 e 2 novamente.
* **Não misture portas:** Se você estiver rodando dev + testes simultaneamente, certifique-se de que as portas `5433` e `5434` estão livres. Erros de `port already in use` indicam que você tem containers rodando e tentou subir outro service na mesma porta externa.
