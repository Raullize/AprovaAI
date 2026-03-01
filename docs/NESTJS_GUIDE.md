# Guia de Sobrevivência ao NestJS

Este guia foi criado para ajudar você a entender rapidamente a arquitetura, os jargões e o fluxo de trabalho do **NestJS**, comparando mentalmente com o Express clássico.

---

## 1. O Conceito Principal: "Opinião e Injeção"

Diferente do Express, onde você é livre para jogar rotas e lógicas em qualquer arquivo, o NestJS é um framework **altamente opinado**. Isso significa que ele te obriga a usar uma estrutura específica baseada em **Classes e Decorators** (aquelas anotações com `@`).

Ele usa fortemente o conceito de **Injeção de Dependências (DI - Dependency Injection)**. Em vez de você criar uma instância manual (`const service = new MeuServico()`), você pede pro NestJS: *"Ei Nest, me dê uma cópia de MeuServico"*, e ele injeta automaticamente no construtor.

---

## 2. A Trindade do NestJS: Modules, Controllers e Providers

Toda feature no Nest (ex: Autenticação, Exames, Tópicos) é dividida em 3 arquivos principais. Vamos usar `Exams` como exemplo.

### 1. Controllers (`exams.controller.ts`)
**O que é?** O "Recepcionista".
- **Express Antigo:** Onde você definia os `router.get('/exams')` e também fazia validações e retornos HTTP.
- **No NestJS:** O Controller **NÃO DEVE** ter regras de negócio (acessar banco, fazer cálculos). Ele só recebe a Requisição (HTTP request), lê os parâmetros (Body, Params) e delega o trabalho pesado para o *Service*. Depois de pegar o resultado, ele devolve pro client.
- **Jargões:** `@Controller('exams')`, `@Get()`, `@Post()`, `@Body()`, `@Param()`.

### 2. Providers / Services (`exams.service.ts`)
**O que é?** O "Cérebro" ou "Operário".
- **Express Antigo:** As funções ou Models soltos onde ficava o Prisma ou TypeORM.
- **No NestJS:** Toda a **Regra de Negócio** vai aqui. É o Service que fala com o banco de dados, que salva coisas, que dispara e-mails. Ele é decorado com `@Injectable()`, o que avisa pro Nest: *"Esse cara é um utilitário que pode ser injetado/usado por outros"*.
- *Obs: "Provider" é o termo geral. O Service é apenas o tipo mais comum de Provider.*

### 3. Modules (`exams.module.ts`)
**O que é?** A "Caixa" ou "Agrupador".
- **Express Antigo:** O `index.js` principal onde você importava todos os seus routers.
- **No NestJS:** Cada domínio (Auth, Exams, etc) tem sua própria caixa fechada. O Módulo avisa pro framework quem são os Controllers daquela área e quem são os Services. Depois, esses módulos são empilhados dentro do arquivo mestre: o **`app.module.ts`**.

---

## 3. Os Seguranças e Fiscais (Middlewares com Nomes Chiques)

No Express, você usava callbacks genéricos no formato `(req, res, next)` para fazer validação, autenticação, pegar erros, etc. O NestJS divide os *middlewares* em tarefas muito específicas:

### Guards (Ex: `jwt-auth.guard.ts`)
**Para que serve?** Segurança na Porta. Ele diz *"Sim"* ou *"Não"*.
- Funciona antes de qualquer coisa para checar **Autenticação e Autorização**. Ele olha a requisição, vê se o token JWT é válido e se a pessoa tem a permissão certa. Se não, toma um "403 Forbidden" ou "401 Unauthorized" direto na cara.

### Pipes (Ex: `ZodValidationPipe`)
**Para que serve?** Validação e Transformação de Dados.
- **Transformação:** Pega uma string vinda da URL `'123'` e converte num número `123`.
- **Validação:** Analisa o corpo do JSON (`req.body`) contra um schema (como o nosso Zod). Se não tiver o "nome" obrigatório, o Pipe bloqueia a requisição de chegar no Controller e joga um erro `$400 Bad Request` limpo pro frontend.

### Interceptors (Ex: `FileInterceptor`)
**Para que serve?** O mutante de Requisição/Resposta.
- Intercepta a chamada **ANTES** e **DEPOIS** do Controller. É usado para fazer cache de respostas, formatar o JSON retornado para sempre ter um padrão `{ data: ... }`, ou interceptar Uploads de Arquivo do Multer e injetar na requisição temporariamente.

### Exception Filters
**Para que serve?** A rede de segurança de Erros.
- Se o seu código crachar em qualquer lugar, em vez de dar timeout ou vazar a stack do Node.js pro usuário final, o filtro "captura" todas as Exceções (`throw new NotFoundException()`) e formata bonitinho padronizado pro frontend como `{ statusCode: 404, message: "Exame não encontrado" }`.

---

## 4. Estrutura Típica de Fluxo de um Endpoint

Vamos imaginar que um admin submeteu um formulário no React para criar um novo "Exame". O que acontece por debaixo dos panos?

1. **Http Request:** Bate no backend (`POST /api/exams`).
2. **Guards:** O `JwtAuthGuard` valida se o token assinado existe e manda pro `RolesGuard`.
3. **Guards (Roles):** O `RolesGuard` vê a anotação `@Roles(UserRole.ADMIN)` do endpoint, checa o usuário do Token e deixa passar.
4. **Pipes:** O `ZodValidationPipe` examina o JSON do Body garantindo que os campos `name` (string) e `description` enviadas são válidas no Zod.
5. **Controller:** O `ExamsController` finalmente pega a requisição, respira fundo, e chama o braço direito: `this.examsService.create(body)`.
6. **Service:** O `ExamsService` recebe os dados, gera uma slug automática limpa, comunica com o PostgreSQL via `PrismaService` e grava a linha. Devolve a linha criada para o Controller.
7. **Http Response:** O Controller devolve felizmante `201 Created` para o seu React.

---

## 5. DTOs (Data Transfer Objects)

**O que são?** O "Contrato" ou "Molde" dos dados.
- **Express Antigo:** Você pegava o `req.body` e torcia para que o frontend tivesse enviado os campos `name` e `email` corretamente. Se não, seu código quebrava em tempo de execução.
- **No NestJS:** Antes de qualquer coisa, você cria uma classe DTO (ex: `CreateExamDto.ts`). Essa classe define **exatamente** quais campos são esperados, seus tipos (`string`, `number`) e regras de validação (usando decorators de bibliotecas como `class-validator` ou schemas do Zod). O DTO serve como um contrato claro entre o frontend e o backend.
- **Vantagem:** Quando um DTO é usado em um Controller junto com um `ValidationPipe`, o NestJS automaticamente valida a requisição. Se o frontend enviar um campo a mais, a menos, ou com o tipo errado, a requisição é rejeitada com um erro `400 Bad Request` antes mesmo de chegar na sua lógica de negócio. Isso torna o código mais seguro, previsível e auto-documentado.

---

## 6. Módulos Dinâmicos (Tópico Avançado)
**O que são?** Módulos "Configuráveis".
- **Cenário:** Imagine que você está criando um módulo para se conectar a um serviço externo (ex: um gateway de e-mail). Em desenvolvimento, você quer usar uma API key de teste, e em produção, uma chave real. Você não pode "chumbar" (hardcode) essa chave dentro do módulo.
- **No NestJS:** Módulos Dinâmicos permitem que você crie um módulo que aceita opções na hora de ser importado. Em vez de apenas `imports: [MailModule]`, você faria algo como `imports: [MailModule.register({ apiKey: 'SUA_CHAVE_AQUI' })]`.
- **Como funciona:** Em vez de exportar a classe do módulo diretamente, você cria um método estático (geralmente `register()` ou `forRoot()`) que retorna um objeto de módulo dinâmico. Esse método pode receber configurações e usá-las para configurar os providers (serviços) internos do módulo.
- **Uso Comum:** É muito usado em bibliotecas de código aberto para NestJS (como `@nestjs/config`, `@nestjs/jwt`) para permitir que os desenvolvedores configurem o módulo de acordo com suas necessidades.

---

## 7. Dicionário (Glossário Rápido de Decorators)

- `@Controller('user')`: Diz que a classe mapeará todas as rotas de `/user...`.
- `@Injectable()`: Colocado sobre Serviços, diz que ele deve ser rastreado no container global de injeção de dependências do Nest.
- `@Get() / @Post() / @Patch()`: Rotas HTTP de acesso.
- `@Req()` ou `@Request()`: Te dá acesso manual rápido ao objeto sujo `request` clássico do Express.
- `@Body() createExamDto: CreateExamDto`: Em vez de pegar o `req.body` genérico, você o tipa com uma classe **DTO**. Isso ativa a validação automática se um `ValidationPipe` estiver configurado.
- `@Param('id')`: Equivalente a extrair algo do `req.params.id`.
- `@Query()`: Equivalente a ler `?page=2` em `req.query`.

---
## Resumo
Pense no NestJS não como uma burocracia, mas como uma **fábrica automobilística com processos bem definidos**.
Se você joga o código em qualquer lugar num Express puro, é como tentar montar um bolo num chão sujo — é libertador, mas a sujeira espalha. No NestJS, se tem um erro de validação, você sabe que tem que ir no Pipe; se erraram a regra de negócio, você conserta o Service; se mudou a URl da API, você só edita a string num Controller. Isso te permite escalar do zero pro 1 milhão de usuários sem a manutenção virar um inferno.
