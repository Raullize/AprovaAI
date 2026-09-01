# AprovaAI - Testes Funcionais End-to-End (E2E)

Este diretorio contem a suite de testes funcionais para o backend do AprovaAI, validando a integracao completa entre as rotas HTTP, as regras de negocio e a persistencia no banco de dados.

## Fluxo de Execucao

A suite executa em tres etapas sequenciais:

1. **seed.js**: Prepara a base de dados inserindo uma massa fixa (usuarios de teste, exames, topicos, niveis, questoes e alternativas).
2. **Jest (runFunctionalTests.js)**: Executa as suites de testes contidas em `src/endpoints`, fazendo requisicoes reais e validando os retornos.
3. **rollback.js**: Limpa todas as tabelas criadas especificamente para o fluxo de testes funcionais, retornando o banco ao estado original.

---

## Como Configurar e Executar os Testes

Para nao correr o risco de apagar ou alterar seus dados de desenvolvimento local, a suite de testes funcionais deve ser executada apontando para um banco de dados de teste isolado.

### Passo 1: Subir o Banco de Testes Isolado

Um container Docker exclusivo para rodar os testes em uma porta diferente (`5433`) ja esta configurado no arquivo `docker-compose.test.yml` na raiz do projeto.

Para subir o banco de testes, execute na raiz do projeto:
```bash
docker compose -f docker-compose.test.yml up -d
```

### Passo 2: Executar as Migrations no Banco de Teste

Antes de rodar os testes pela primeira vez, voce precisa gerar as tabelas no banco de testes. Na pasta `backend`, execute:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/aprovaai_test" npx prisma migrate deploy
```

### Passo 3: Variaveis de Ambiente do Teste

O arquivo `.env` com as configuracoes padrao de teste ja foi criado em `__functional_tests__/.env`. Caso precise customizar portas ou hosts, altere os valores contidos nele:

```env
APPLICATION_BASE_URL=http://localhost:3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/aprovaai_test
```

### Passo 4: Rodar a Suite de Testes Funcionais

Garanta que o backend do AprovaAI esta rodando na porta correta (3001) conectando-se ao banco de teste. 
Na pasta `backend`, voce pode rodar:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/aprovaai_test" PORT=3001 pnpm start:dev
```

Em seguida, no diretorio `__functional_tests__`, execute:
```bash
npm run test
```

Este comando vai:
1. Validar se a API esta no ar respondendo na rota de healthcheck (/health).
2. Rodar o seed para preparar o cenario.
3. Executar os testes com o Jest.
4. Rodar o rollback para limpar as tabelas.

## Cobertura de Cenarios (Heuristica VADER)

Os testes estao organizados seguindo o padrao de pastas do coordenador (por recurso e verbo HTTP) na pasta `src/endpoints`:

- **account/**:
  - `GET/profile.test.js`: Consulta dos dados cadastrais do perfil.
  - `PATCH/profile.test.js`: Atualizacao dos dados cadastrais.
  - `DELETE/delete.test.js`: Exclusao permanente da conta do usuario.
- **auth/**:
  - `POST/login.test.js`: Autenticacao com credenciais validas e validacoes de erro.
  - `POST/register.test.js`: Registro de novas contas e validacao de duplicidades.
- **exams/**:
  - `GET/list-exams.test.js`: Consulta da listagem geral de exames.
  - `GET/get-exam.test.js`: Detalhamento de um exame por ID ou por Slug.
  - `POST/create-exam.test.js`: Criacao de novos exames (validando permissao de Administrador).
- **simulations/**:
  - `GET/history.test.js`: Listagem do historico de simulados do usuario.
  - `POST/start.test.js`: Inicializacao de simulados para um nivel especifico.
  - `POST/answers.test.js`: Registro de respostas corretas, incorretas e sinalizacao para revisao.
  - `POST/finish.test.js`: Conclusao do simulado com calculo de XP, estrelas e status de aprovacao.
- **student/**:
  - `GET/dashboard-stats.test.js`: Consulta de ofensiva (streak) e datas de atividades.
  - `GET/leaderboard.test.js`: Ranking global de estudantes por XP acumulado.
  - `GET/streak-leaderboard.test.js`: Ranking global de recordes de ofensivas.

