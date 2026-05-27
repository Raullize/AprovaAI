> Este README serve como referência para o projeto AprovaAI. Como a aplicação está em fase de desenvolvimento, algumas características descritas aqui podem ser alteradas ou ajustadas ao longo do tempo.

<h1 align="center">AprovaAI</h1>

<p align="center">
  <img src="http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white"/>
</p>

---

## Descrição

O **AprovaAI** é uma plataforma inovadora de estudos focada em auxiliar estudantes na preparação para diversos tipos de exames — desde vestibulares tradicionais (como ENEM e ITA) até certificações profissionais (como AWS e OAB). Inspirado em uma metodologia de aprendizado por níveis e gamificação, o AprovaAI oferece simulados personalizados, feedback detalhado e acompanhamento de desempenho para otimizar a jornada de estudo do usuário.

O conteúdo é organizado de forma hierárquica: **Exame → Tópico → Nível → Questões**, permitindo que o aluno avance progressivamente e domine cada área antes de passar para o próximo desafio.

---

## Características Principais

- **Simulados por Nível** — Estrutura `Exame > Tópico > Nível > Questões` para aprendizado progressivo
- **Gamificação** — Sistema de medalhas, conquistas e streaks para motivar o estudo contínuo
- **Prof. Sabichão** — Mascote e assistente inteligente para tirar dúvidas *(em desenvolvimento)*
- **Feedback Detalhado** — Explicações específicas para cada alternativa e links de aprofundamento
- **Drag & Drop** — Reordenação intuitiva de exames, tópicos, níveis e questões pelo admin
- **Controle de Status** — Ativação/desativação de conteúdo sem necessidade de exclusão
- **Interface Responsiva** — Design moderno que funciona em qualquer dispositivo
- **Autenticação Segura** — JWT com controle de acesso por perfil (Admin / Aluno)

---

## Planos de Acesso

O AprovaAI oferece dois planos para atender às necessidades de estudo:

### Free Tier
- Acesso aos níveis e conteúdos iniciais
- Período de espera de **6 horas** entre simulados
- Acesso limitado ao chatbot Prof. Sabichão *(futuro)*
- Pode conter anúncios

### Premium
- **Simulados ilimitados** sem tempo de espera
- Acesso ilimitado ao chatbot Prof. Sabichão *(futuro)*
- Relatórios de desempenho detalhados (pontos fortes/fracos, evolução por conteúdo)
- Acesso antecipado a novos conteúdos e exames
- Questões exclusivas
- Remoção de anúncios
- Prioridade no suporte

---

## Funcionalidades da Primeira Versão (MVP)

### Para o Usuário (Estudante)

- **Simulados por Nível:** Faça simulados divididos por `Exame > Tópico > Nível > Questões`
- **Níveis de Dificuldade:** Cada nível oferece questões focadas naquele conteúdo
- **Simulado Diversificado:** O último nível de cada tópico apresenta questões mais variadas para consolidar o aprendizado
- **Tipos de Questões:** Múltipla escolha com uma ou mais alternativas corretas
- **Feedback Detalhado:**
  - Resultado imediato (`Certo/Errado`) após confirmar a resposta
  - Explicações por alternativa detalhando o motivo de estar certa ou errada
  - Links opcionais para aprofundamento no tema
- **Gamificação e Conquistas:** Receba medalhas por marcos como:
  - "Simulados Perfeitos" (100% de acertos)
  - "10 Dias Seguidos" (streak de estudos)
  - "Maratonista de [Matéria]" (completar níveis de um conteúdo)
  - "Especialista [Exame]" (concluir todos os conteúdos de um exame)
- **Streak de Dias:** Visualize seu progresso contínuo de estudos

### Para o Administrador

O perfil administrador possui controle total sobre o conteúdo da plataforma:

- **Gerenciamento de Exames:** CRUD completo com controle de status (ativo/inativo) e reordenação
- **Gerenciamento de Conteúdo:** CRUD de Tópicos, Níveis e Questões com drag & drop para reordenar
- **Personalização de Níveis:** Definir XP de recompensa e percentual mínimo de aprovação
- **Configuração de Feedback:** Adicionar explicações por alternativa e links de aprofundamento
- **Gerenciamento de Usuários:** Controlar planos de acesso (Free/Premium), ativar/desativar contas
- **Upload de Imagens:** Adicionar imagens às questões para contexto visual

---

## Arquitetura

O projeto é dividido em duas partes principais, com o backend seguindo rigorosamente os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**.

```text
AprovaAI/
├── frontend/           # React + Vite + TypeScript (SPA)
│   └── README.md       # Documentação do frontend
├── backend/            # Node.js + NestJS + Prisma (API REST - Clean Architecture)
│   └── README.md       # Documentação do backend
└── docs/               # Documentação detalhada da arquitetura, guias e histórico
```

## Documentação de Arquitetura Detalhada

Para compreender a fundo as decisões técnicas e arquiteturais deste projeto, consulte os documentos a seguir:

- [**Evolução da Arquitetura**](docs/ARCHITECTURE_EVOLUTION.md) - Explica a trajetória do projeto desde um monolito legado até a adoção do DDD, incluindo a decisão estratégica de manter o purismo arquitetural frente ao desenvolvimento orquestrado por IA (Agentic Orchestration).
- [**Backend Architecture (Clean Arch & DDD)**](docs/BACKEND_ARCHITECTURE.md) - Manual completo de como o código do backend está organizado, detalhando Mappers, Aggregate Roots, Repositórios em Memória e o fluxo de dados.
- [**Frontend Architecture**](docs/FRONTEND_ARCHITECTURE.md) - Padrões de organização, gerenciamento de estado e bibliotecas usadas no cliente React.
- [**Guia NestJS**](docs/NESTJS_GUIDE.md) - Manual focado no uso do framework.

---

## Como Iniciar

Consulte os READMEs individuais para instruções detalhadas:

- **[Backend — Configuração e API](./backend/README.md)**
- **[Frontend — Configuração e Interface](./frontend/README.md)**

---

## Contribuição

Contribuições são sempre bem-vindas!

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request
