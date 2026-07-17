# Guide to Unit Testing (Guia de Testes Unitários)

O AprovaAI adota uma estratégia de desenvolvimento altamente orientada a testes. Graças ao uso da **Clean Architecture** (Arquitetura Limpa), o núcleo da aplicação (regras de negócio nos Casos de Uso e Entidades) é totalmente independente do banco de dados relacional e de frameworks externos, permitindo uma suíte de testes extremamente rápida, isolada e confiável.

---

## 1. Fundamentação Teórica: Inversão de Dependência (SOLID)

Em arquiteturas convencionais, os serviços de aplicação contêm chamadas diretas ao ORM (ex: `prisma.user.create`). Isso gera acoplamento físico e torna impossível testar o serviço sem ter um banco de dados real rodando.

No AprovaAI, aplicamos o princípio da **Inversão de Dependência** (letra **D** do SOLID):
* **O Caso de Uso (`src/application/use-cases/`)** não conhece o Prisma nem o banco de dados. Ele conhece apenas um **Contrato** (uma interface TypeScript como `UserRepository`).
* A implementação real (`PrismaUserRepository` na camada de infraestrutura) herda e implementa essa interface.
* Para os testes, criamos outra classe que também implementa essa mesma interface: o **`InMemoryUserRepository`**.

Isso nos permite trocar a engine de dados em tempo de execução. O Caso de Uso apenas executa comandos na abstração, sem se importar se por trás há uma query SQL ou um array em memória.

---

## 2. Como funcionam os Repositórios em Memória (*In-Memory*)

Os repositórios em memória simulam um banco de dados real inteiramente na memória RAM do computador usando estruturas de dados simples (arrays e dicionários JavaScript).

Eles estão localizados na pasta: [`backend/test/repositories/`](file:///home/raullize/Projects/AprovaAI/backend/test/repositories).

### Exemplo de funcionamento:
Ao analisar o [`in-memory-user.repository.ts`](file:///home/raullize/Projects/AprovaAI/backend/test/repositories/in-memory-user.repository.ts):

* **Armazenamento:** Os registros são guardados no array interno:
  ```typescript
  public items: User[] = [];
  ```
* **Simulação de Leitura (Buscar por ID):** Em vez de executar uma query SQL `SELECT * FROM users WHERE id = ...`, o repositório usa o método nativo de arrays do Javascript:
  ```typescript
  async findById(id: string): Promise<User | null> {
    const user = this.items.find((item) => item.id === id);
    return user || null;
  }
  ```
* **Simulação de Gravação (Salvar / Criar):**
  ```typescript
  async create(user: User): Promise<User> {
    this.items.push(user);
    return user;
  }
  ```

---

## 3. O Fluxo de Execução de um Teste Unitário

Para entender a dinâmica de validação das regras, vejamos o passo a passo da execução do caso de uso de simulação [`start-simulation.use-case.spec.ts`](file:///home/raullize/Projects/AprovaAI/backend/src/application/simulations/use-cases/__tests__/unit/start-simulation.use-case.spec.ts):

```mermaid
sequenceDiagram
    participant Test as Suíte Jest (.spec.ts)
    participant InMemory as Repositório em Memória
    participant UseCase as Caso de Uso (sut)
    
    rect rgb(240, 248, 255)
        note over Test: Fase 1: Setup (beforeEach)
        Test->>InMemory: Instancia instâncias zeradas de repositórios em memória
        Test->>UseCase: Instancia caso de uso injetando os repositórios em memória
    end
    
    rect rgb(245, 245, 245)
        note over Test: Fase 2: Preparação dos dados (Seed/Arrange)
        Test->>InMemory: Adiciona mocks necessários (ex: cria um Simulation válido no array)
    end
    
    rect rgb(255, 253, 240)
        note over Test: Fase 3: Execução (Act)
        Test->>UseCase: sut.execute({ userId, simulationId })
        UseCase->>InMemory: findById(simulationId) (Busca no array)
        InMemory-->>UseCase: Retorna simulado mockado
        UseCase->>UseCase: Valida regras (ex: simulation tem questões?)
        UseCase->>InMemory: create(newSimulation) (Dá push no array)
        UseCase-->>Test: Retorna Simulado Criado (SimulationAttempt)
    end
    
    rect rgb(240, 255, 240)
        note over Test: Fase 4: Asserções (Assert)
        Test->>Test: expect(result.status).toBe('IN_PROGRESS') (Valida retorno)
        Test->>InMemory: expect(simulationAttemptRepository.items).toHaveLength(1) (Valida persistência)
    end
```

### Vantagens desse fluxo:
1. **Velocidade:** Toda a gravação e leitura acontecem instantaneamente na memória RAM do computador. Mais de 30 testes são concluídos em menos de **0.5 segundos**.
2. **Isolamento Total:** Se o banco PostgreSQL ou o contêiner Docker cair, a suíte de testes de regras de negócio continuará rodando com 100% de sucesso.
3. **Sem Estado Sujo:** Graças ao `beforeEach` instanciando novas classes do repositório, cada teste começa em um ambiente totalmente limpo, impedindo que um teste interfira na execução de outro.

---

## 4. Provedores Falsos (*Fake Providers*)

Além dos bancos de dados, o AprovaAI também simula serviços auxiliares pesados de infraestrutura para evitar lentidão nos testes.
* **Criptografia com Bcrypt:** O Bcrypt consome muito poder de processamento da CPU por design (para dificultar ataques de força bruta). Nos testes unitários, não queremos essa lentidão.
* **Solução ([`fake-hash.provider.ts`](file:///home/raullize/Projects/AprovaAI/backend/test/providers/fake-hash.provider.ts)):** Criamos um provedor que simplesmente anexa a string `"-hashed"` ao final da senha. Isso simula o comportamento de cifragem instantaneamente sem nenhum custo de CPU para a máquina de desenvolvimento.

---

## 5. Como Executar os Testes no Terminal

Abra o terminal na pasta raiz do backend e execute os comandos:

```bash
# Navegar até a pasta do backend
cd backend

# 1. Executar todos os testes unitários da aplicação
pnpm test

# 2. Executar os testes em modo "Watch" (executa automaticamente a cada alteração de código)
pnpm test:watch

# 3. Executar os testes e gerar relatório visual de cobertura (Coverage)
pnpm test:cov
```

O relatório de cobertura de código (*Coverage*) ajuda a demonstrar de forma quantitativa para o orientador/banca a qualidade do AprovaAI, mostrando exatamente quais arquivos de Caso de Uso e Entidades possuem cobertura de testes de 100%.
