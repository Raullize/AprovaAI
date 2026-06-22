# Guia de Testes

O AprovaAI foi projetado seguindo os princípios da **Clean Architecture**, o que torna a aplicação altamente testável. A nossa principal estratégia de qualidade se apoia em **Testes Unitários**.

## Estratégia: Inversão de Dependência

Em uma aplicação comum, a lógica de negócio costuma estar acoplada ao banco de dados (ex: chamando o Prisma diretamente no serviço). Isso torna os testes lentos e dependentes de infraestrutura.

No AprovaAI, usamos a Inversão de Dependência (a letra "D" do SOLID):
- Nossos Casos de Uso (Use Cases) não conhecem o Prisma.
- Eles conhecem apenas "Contratos" (Interfaces) dos repositórios.

Isso nos permite criar um ecossistema de testes isolado e extremamente rápido.

## Repositórios em Memória (In-Memory Repositories)

Para testar as regras de negócio sem precisar do banco de dados, criamos Repositórios Falsos, localizados na pasta `backend/test/repositories/`.

**O que eles são?**
São classes TypeScript que implementam os mesmos contratos dos repositórios originais, mas em vez de fazerem queries SQL, eles salvam as entidades em simples *Arrays* na memória RAM (ex: `public items: User[] = []`).

**Por que usamos?**
- **Velocidade:** Testes rodam em milissegundos.
- **Isolamento:** Nenhuma falha de rede ou de configuração do PostgreSQL afetará o teste da regra de negócio.
- **Limpeza:** A cada novo teste, instanciamos um novo repositório em memória vazio, evitando que dados "sujem" os testes seguintes.

## Fake Providers

Assim como o banco de dados, também abstraímos outras ferramentas externas, como bibliotecas de criptografia.
Em `backend/test/providers/fake-hash.provider.ts`, criamos um provedor que apenas anexa um sufixo `"-hashed"` à senha, simulando o bcrypt, mas sem o custo computacional real que deixaria a suíte de testes lenta.

## Como Executar os Testes

Para rodar a suíte de testes unitários do backend:

```bash
cd backend

# Rodar todos os testes unitários
pnpm test

# Rodar os testes no modo "watch" (para desenvolvimento)
pnpm test:watch

# Rodar os testes e gerar um relatório de cobertura (Coverage)
pnpm test:cov
```

O relatório de cobertura mostrará exatamente quais linhas de código dos Casos de Uso e das Entidades ainda não foram validadas pelos testes.
