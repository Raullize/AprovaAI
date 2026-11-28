# Guia do Docker

O AprovaAI utiliza o Docker para facilitar o provisionamento do ambiente de desenvolvimento. O Docker garante que qualquer desenvolvedor possa subir os serviços necessários (como o banco de dados) sem precisar instalar e configurar tudo manualmente na própria máquina.

## Arquivo de Configuração

O arquivo principal que gerencia isso é o `docker-compose.yml`, localizado na raiz do projeto. Ele descreve quais "containers" (serviços isolados) a nossa aplicação precisa. Atualmente, configuramos nele o banco de dados PostgreSQL, o Redis (cache e rate limiting) e o Redis Insight (interface visual para inspecionar o Redis).

## Fluxo de Desenvolvimento Local

A abordagem recomendada e mais performática para o desenvolvimento local do AprovaAI é **rodar a aplicação nativamente** e deixar o Docker cuidar apenas da **infraestrutura**. 

Para isso, siga exatamente este fluxo:

### Passo 1: Subir a Infraestrutura

```bash
docker compose up -d postgres redis
```
**O que este comando faz:** 
Sobe apenas os containers de infraestrutura: PostgreSQL (porta `5433`) e Redis (porta `6379`). O parâmetro `-d` (detached) diz ao Docker para deixá-los rodando em segundo plano (background). Neste momento, **a sua API (NestJS) ainda não está no ar**, apenas a infraestrutura está aguardando conexões.

Se quiser usar apenas o modo em memória (sem Redis), rode apenas `docker compose up -d postgres` e mantenha `CACHE_DRIVER=memory` no `.env`.

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

## Redis: cache e rate limiting

O backend usa Redis em dois pontos da integração com a API pública do ENEM:

- **Cache das questões** — evita baixar novamente o mesmo ano/disciplina/idioma por 10 minutos.
- **Rate limit distribuído** — garante o limite de 1 requisição por segundo da enem.dev mesmo com mais de uma instância do backend.

Para habilitar, adicione ao `backend/.env`:

```env
CACHE_DRIVER=redis
REDIS_URL=redis://localhost:6379
```

Para usar o comportamento local (sem Redis), mantenha:

```env
CACHE_DRIVER=memory
```

> **Fallback:** se `CACHE_DRIVER=redis` e o Redis estiver indisponível, o backend usa automaticamente as implementações em memória. A geração do simulado continua funcionando, mas o rate limit passa a valer por instância, e não de forma global.

### Chaves criadas no Redis

| Chave | Conteúdo | TTL |
|---|---|---|
| `aprovaai:enem:v1:<ano>:<disciplina>:<idioma>` | Lista de questões já normalizadas em JSON | 10 minutos |
| `aprovaai:enem:v1:rate-limit` | Reserva da janela de 1 req/s | ~1,1 segundo |

Exemplos de inspeção via CLI:

```bash
docker compose exec redis redis-cli KEYS 'aprovaai:enem:v1:*'
docker compose exec redis redis-cli TTL aprovaai:enem:v1:2023:matematica:all
docker compose exec redis redis-cli --raw GET aprovaai:enem:v1:2023:matematica:all
```

### Redis Insight (interface visual)

O `docker-compose.yml` também inclui o **Redis Insight**, uma interface gráfica oficial para navegar pelas chaves, valores e TTLs.

```bash
docker compose up -d redis-insight
```

Acesse [http://localhost:5540](http://localhost:5540) e, na tela **Add Redis Database**, informe:

- **Host:** `redis`
- **Port:** `6379`
- **Database Alias:** `AprovaAI`
- **Username / Password:** deixe em branco

> Use o host `redis` (nome do serviço no Compose), e não `localhost`, porque a conexão é feita de dentro do container do Redis Insight.

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

> Os testes funcionais usam `CACHE_DRIVER=memory` e não exigem Redis. O teste de integração do Redis é opcional e só roda quando `REDIS_INTEGRATION_TEST=1` e `REDIS_URL` estão definidos.

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

* **Derrubar os serviços:** Quando terminar de trabalhar, você pode parar os containers executando `docker compose stop` ou `docker compose down` (o `down` remove os containers).
* **Resetar os dados:** Se precisar limpar tudo, pode rodar `docker compose down -v` para destruir os containers e os volumes de dados (PostgreSQL, Redis e configurações do Redis Insight). Depois, é só seguir o Passo 1 e 2 novamente.
* **Não misture portas:** Se você estiver rodando dev + testes simultaneamente, certifique-se de que as portas `5433` e `5434` estão livres. Erros de `port already in use` indicam que você tem containers rodando e tentou subir outro service na mesma porta externa.
