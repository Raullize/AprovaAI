# Documentacao de Arquitetura: AprovaAI Backend

Este documento descreve a arquitetura atual do backend do AprovaAI. Durante o desenvolvimento, o projeto evoluiu de uma arquitetura padrao em camadas (MVC-like) do NestJS para uma **Clean Architecture (Arquitetura Limpa)** orientada a **Domain-Driven Design (DDD)**.

O objetivo dessa mudanca foi garantir:
- **Desacoplamento Tecnologico**: As regras de negocio vitais estao isoladas de tecnologias externas. O Dominio nao sabe da existencia do banco de dados (Prisma), do framework web (NestJS) ou de bibliotecas externas de criptografia.
- **Testabilidade**: Casos de uso e entidades podem ser testados unitariamente sem depender de banco de dados, configuracoes pesadas ou requisicoes HTTP.
- **Manutenibilidade**: A divisao clara de responsabilidades facilita a escalabilidade estrutural do time e do codigo.

---

## Estrutura de Diretorios (Visao Geral)

A pasta `src` do backend esta dividida em 5 blocos principais, respeitando a **Regra de Dependencia** da Clean Architecture: codigos das camadas externas apenas conhecem as camadas internas. A camada mais interna nao conhece nada sobre as que estao fora dela.

```text
backend/src/
|-- api/                # Camada de Interface (Controllers, DTOs, Guards)
|-- application/        # Camada de Aplicacao (Use Cases, Ports)
|-- domain/             # Camada de Dominio (Entidades, VOs, Repositorios, Eventos)
|-- infrastructure/     # Camada de Infraestrutura (Prisma, Providers, Mappers)
|-- shared/             # Utilitarios Transversais e Abstracoes Core
```

O Fluxo Logico de dependencias e: `API -> Application -> Domain <- Infrastructure`

---

## Detalhamento das Camadas

### 1. Domain (Dominio - Coracao do Sistema)

Essa e camada central. Nao possui **nenhuma** dependencia de framework web (como NestJS), de banco de dados (Prisma) ou de bibliotecas de validacao (Zod). E puro TypeScript estruturando a logica de negocios isolada em Contextos (ex: `content/`, `users/`).

Dentro de cada contexto, subpastas especificas organizam o dominio:

- **`entities/` (Aggregate Roots e Entidades)**: Representam os objetos centrais do negocio, dotados de estado e comportamento. Um *Aggregate Root* e o ponto de entrada principal para uma arvore de objetos (ex: `Level`, `User`). Ao inves de usar setters sem controle, nossas entidades possuem metodos que protegem suas invariantes (regras de negocio). Exemplo: usar `user.grantXp(50)` garante que ninguem passe um valor de XP negativo.
- **`value-objects/`**: Tipos imutaveis criados para encapsular logicas e validacoes de tipos primitivos, combatendo a *Primitive Obsession*. `Email`, `Percentage`, ou `Slug` nao sao strings puras, sao Value Objects que se auto-validam ao serem instanciados (`Percentage.create(50)`).
- **`repositories/` (Interfaces/Contracts)**: O Dominio define abstracoes para acessar ou persistir Entidades, mas nao implementa o "como". Em `level.repository.ts`, definimos `findById()` ou `save()`. Nenhum import do Prisma/SQL ocorre aqui.
- **`errors/`**: Os erros de violacoes de negocio nao sao excecoes HTTP. Criamos excecoes como `SlugAlreadyInUseError` ou `ResourceNotFoundError` herdando de `AppError`. Se algo da errado, emitimos este sinal puramente semantico.
- **`events/` (Domain Events)**: Mecanismos para disparar efeitos colaterais desacoplados. Quando algo importante acontece (`LevelCreatedEvent`), o aggregate despacha na memoria para que Listeners sejam acionados sem amarrar regras de forma sincrona nos Use Cases.

### 2. Application (Aplicacao - Orquestradora)

Essa camada orquestra a logica de negocio contida no `Domain`. Os Casos de Uso guiam o fluxo, da requisicao inicial a resposta final. Nao sabe qual e o BD, tampouco a rota HTTP acionada.

- **`use-cases/`**: Classes com um unico metodo `execute()` que representam acoes funcionais estritas. Cada Caso de Uso possui um arquivo isolado (ex: `find-level-by-slug.use-case.ts`), respeitando SRP. O Use Case injeta contratos via inversao de controle (`constructor(private repo: LevelRepository)`), interage com regras da entidade do Domain e salva no repositorio (`repo.save(level)`).
- **`ports/`**: Interfaces adicionais para servicos externos que a aplicacao precisa (ex: `HashProvider`, `TokenProvider`).

### 3. Infrastructure (Infraestrutura)

A camada mais externa conectada ao "Mundo Externo". Aqui os "contratos" definidos nas outras partes ganham implementacoes tecnicas reais utilizando injecao de dependencias.

- **Database (`database/prisma/`)**: 
  - **Repositorios (`repositories/`)**: Classes concretas que acessam efetivamente o banco, aplicando chamadas brutas a infra (ex: `this.prisma.level.findMany(...)`) satisfazendo as interfaces do Dominio.
  - **Mappers (`mappers/`)**: Classes estritamente necessarias para nao vazar o ORM para o sistema. Traduzem os dados crus da tabela Prisma para as "Entidades" ricas do Dominio (`PrismaLevelMapper.toDomain(raw)` devolve uma arvore Aggregate Root isolada) e vice-versa.
- **Providers (`providers/`)**: Implementacoes reais de servicos utilitarios. Exemplo: `BcryptHashProvider` implementa regras de criptografia satisfazendo a porta `HashProvider` requerida pela Application.

### 4. API (Apresentacao / Interface)

A porta de entrada HTTP da aplicacao. Profundamente acoplada ao ecossistema NestJS, Zod e a Web. Extrai os bytes da internet e os passa para o formato compreendido pela Application.

- **Controllers**: Ouvem rotas (`@Get()`, `@Post()`), extraem o `body` ou `params` e delegam o trabalho de execucao ao Use Case apropriado. Nao possuem instrucoes complexas de "if/else" contendo regras cruciais de negocio.
- **DTOs (Data Transfer Objects)**: Validam formato dos inputs vindo da web usando `Zod` (`createLevelSchema`) assegurando consistencia de tipos antes mesmo da solicitacao avancar.
- **Guards/Decorators**: Lidam com protecao de rotas (`JwtAuthGuard`, `RolesGuard`), validando token e missoes de identidade.

### 5. Shared (Core Support)

Pecas transversais, transmutaveis e fundacionais de infraestrutura que baseiam dependencias de todo o projeto.

- **`core/`**: Nucleo com blocos padroes de arquitetura DDD em forma abstrata: `entity.ts`, `aggregate-root.ts`, `value-object.ts`, onde caracteristicas sistemicas vitais como Identidade base (`UUID`) ou disparadores de `DomainEvents` repousam. Inclui o super-classe de erro base `AppError`.
- **`filters/`**: Adaptadores como o `DomainExceptionFilter`, componente capaz de capturar e encampar excecoes da logica `AppError` e transforma-las impecavelmente em restricoes customizadas via HTTP antes de retornar proscricoes abertas.

---

## Fluxo de Dados Pratico (Data Flow Exemplo)

Observe aqui um Update de Fase (Level) atuando na pratica ponta-a-ponta:

1. **API (`LevelsController`)**: O usuario solicita `PATCH /levels/123`. A rota aciona validadores do `Zod` atraves do DTO.
2. **API -> Application**: Controller engatilha informacoes na chamada para `UpdateLevelUseCase.execute({ id, data })`.
3. **Application -> Infrastructure**: O Use Case orquestra enviando ao Repositorium `this.levelRepository.findById(id)`.
4. **Infrastructure (Database)**: O objeto ORM faz a request no SQL (PostgreSQL via Prisma), extrai chaves em banco de dados para a arvore interna e o `PrismaLevelMapper` processa e materializa uma base pronta carregada na classe `Level`.
5. **Application -> Domain**: Repositorio devolve este `AggregateRoot` da memoria limpo ao Use Case. O Use Case dispara o comportamento: `level.updateDetails({ name, slug: Slug.create(novoSlug) })`. As operacoes de checagem do ValueObjects processam limpas e restritas. Nenhuma interferencia real ao banco de dados e tocada aqui.
6. **Persistencia (Application -> Infra)**: Regras devidamente checadas, Use Case encerra sua orquestracao emitindo `repository.save(level)`.
7. **Infrastructure -> Database**: O Repositorio, ciente, traduz essa rica Entidade ao schema puro pelo inversor `toPrisma(level)` e executa a acao base `UPDATE` selando a alteracao definitiva.
8. **Application -> API**: O Use Case finaliza e devolve o fluxo seguro devolta para a camada estrita web fechar o request HTTP com a versao `toJSON()`.

---

## Escolhas Tecnicas Refletidas

- **Zod em vez de Class-Validator**: Foi selecionado por viabilizar uma modelagem de schema funcional muito mais segura sem encadear os DTOs com centenas de decoradores pesados.
- **Injecao de Dependencia (DI)**: Componente do framework Web aproveitado amplamente para engatilhar metodos tecnicos (Infra) satisfazendo as portas agnosticas de dominio (Application Domain UseCases).
