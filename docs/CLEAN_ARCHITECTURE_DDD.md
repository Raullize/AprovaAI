# Arquitetura do Backend: Clean Architecture & DDD

Este documento descreve a arquitetura atual do backend do AprovaAI. Durante o desenvolvimento, o projeto evoluiu de uma arquitetura padrão em camadas (MVC-like) do NestJS para uma **Clean Architecture (Arquitetura Limpa)** orientada a **Domain-Driven Design (DDD)**.

O objetivo dessa mudança foi garantir:
- **Desacoplamento Tecnológico**: As regras de negócio não sabem da existência do banco de dados (Prisma), do framework web (NestJS) ou de bibliotecas externas de criptografia.
- **Testabilidade**: Casos de uso e entidades podem ser testados unitariamente sem depender de banco de dados ou requisições HTTP.
- **Manutenibilidade**: A divisão clara de responsabilidades facilita a escalabilidade do time e do código.

---

## 🏗 Estrutura de Diretórios

A pasta `src` do backend está dividida em 4 blocos principais, respeitando a Regra de Dependência (Dependency Rule) da Clean Architecture: de fora para dentro.

```text
backend/src/
├── api/                # Camada de Interface (Controllers, DTOs, Rotas)
├── application/        # Camada de Aplicação (Use Cases, Ports)
├── domain/             # Camada de Domínio (Entidades, Interfaces de Repositório)
├── infrastructure/     # Camada de Infraestrutura (Prisma, Jwt, Mappers)
└── shared/             # Core e Utils compartilhados (Filtros, Exceções)
```

---

## 🧩 Detalhamento das Camadas

### 1. Domain (Domínio)
A camada mais interna. Ela contém o "Coração" do software. **Não importa nada de fora** (nem NestJS, nem Prisma).
- **Entidades (`entities/`)**: Classes ricas que representam os conceitos de negócio (`Exam`, `Topic`, `Level`, `Question`, `User`). Elas não são modelos de banco de dados, elas encapsulam as regras e os dados do domínio (usando `getters` e escondendo a propriedade `props`).
- **Interfaces de Repositório (`repositories/`)**: Contratos (interfaces abstratas) que definem quais operações de banco de dados as entidades precisam. A implementação real fica na Infraestrutura.

### 2. Application (Aplicação)
A camada que orquestra o negócio. Conhece o Domínio, mas ainda não conhece a Web ou o Banco de Dados.
- **Use Cases (`use-cases/`)**: Classes com um único método `execute()`. Cada Use Case representa uma ação do sistema (ex: `CreateExamUseCase`, `AuthenticateUserUseCase`). Eles pegam os dados, chamam as Entidades para validar as regras e usam os contratos de Repositório para salvar.
- **Ports (`ports/`)**: Interfaces adicionais para serviços externos que a aplicação precisa (ex: `StorageProvider` para salvar imagens).

### 3. Infrastructure (Infraestrutura)
A camada mais externa e "suja". É aqui que as bibliotecas e frameworks de persistência entram.
- **Database (`database/prisma/`)**: 
  - **Repositórios (`repositories/`)**: Classes concretas que implementam as interfaces do Domínio usando o `PrismaClient`.
  - **Mappers (`mappers/`)**: Classes que traduzem os dados "crus" do Prisma para as "Entidades" ricas do Domínio, e vice-versa. Isso isola o Domínio do esquema do banco de dados.
- **Providers (`providers/`)**: Implementações reais de serviços como JWT (Geração de Tokens), Bcrypt (Hash de senhas) e LocalStorage (Salvar imagens em disco).

### 4. API (Apresentação / Interface)
A porta de entrada HTTP da aplicação.
- **Controllers**: Recebem as requisições (GET, POST), extraem os dados do body/params e chamam os Use Cases da camada de Aplicação.
- **DTOs (Data Transfer Objects)**: Validam o que vem da internet usando `Zod` antes de passar para a Aplicação.
- **Guards/Decorators**: Lidam com a autenticação e autorização (`JwtAuthGuard`, `RolesGuard`).

---

## 🔄 Fluxo de Dados (Data Flow)

Quando um usuário Admin cria uma nova Questão, este é o caminho que a informação percorre:

1. **API**: O `QuestionsController` recebe o POST. O `ZodValidationPipe` valida o `CreateQuestionDto`.
2. **API -> Application**: O Controller chama o `CreateQuestionUseCase.execute(dados)`.
3. **Application -> Domain**: O Use Case orquestra a lógica. Ele chama a Factory `Question.create()` (na camada de Domínio) que aplica as regras de negócio iniciais e cria a Entidade em memória.
4. **Application -> Infrastructure**: O Use Case chama `this.questionRepository.create(question)`.
5. **Infrastructure (Mapper)**: O `PrismaQuestionRepository` usa o `PrismaQuestionMapper.toPrisma()` para converter a entidade em um objeto que o Prisma entenda.
6. **Infrastructure (Database)**: O Prisma salva no PostgreSQL.
7. **Infrastructure -> Application**: O Repositório mapeia a resposta de volta para a Entidade (`PrismaQuestionMapper.toDomain()`) e devolve para o Use Case.
8. **Application -> API**: O Use Case devolve a entidade para o Controller.
9. **API**: O NestJS chama o `.toJSON()` da Entidade e devolve o JSON para o Frontend.

---

## 🛠 Escolhas Técnicas e Padrões
- **Zod em vez de Class-Validator**: Escolhido por permitir uma validação de esquema mais funcional e segura, sem encher os DTOs de decoradores intrusivos.
- **Injeção de Dependência (DI)**: O framework NestJS é utilizado intensamente para injetar as implementações da *Infraestrutura* nos *Use Cases* da *Aplicação*, mantendo as camadas isoladas.
- **DomainExceptionFilter**: Um filtro global que intercepta erros jogados pelo Domínio e pela Aplicação, convertendo-os em respostas HTTP padronizadas (evitando que lógica HTTP suje as camadas internas).
