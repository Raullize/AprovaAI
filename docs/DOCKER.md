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

## Dicas Úteis

* **Derrubar os serviços:** Quando terminar de trabalhar, você pode parar o banco de dados executando `docker compose stop` ou `docker compose down` (o `down` remove os containers).
* **Resetar o banco:** Se precisar limpar tudo, pode rodar `docker compose down -v` para destruir o container e os volumes de dados. Depois, é só seguir o Passo 1 e 2 novamente.
