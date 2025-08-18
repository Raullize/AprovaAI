> Este README serve como referência para o projeto AprovaAI. Como a aplicação está em fase de desenvolvimento, algumas características descritas aqui podem ser alteradas ou ajustadas ao longo do tempo.

# AprovaAI 🎓

[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.en.md)

![AprovaAI Logo](public/images/prof-sabichao.png)

## 📋 Descrição

O **AprovaAI** é uma plataforma inovadora de estudos focada em auxiliar estudantes na preparação para diversos tipos de exames, desde vestibulares tradicionais (como ENEM, ITA) até certificações profissionais (como AWS). Inspirado em uma metodologia de aprendizado por níveis e gamificação, o AprovaAI oferece simulados personalizados, feedback detalhado e acompanhamento de desempenho para otimizar a jornada de estudo do usuário.

### 🚀 Características Principais

- **🎯 Simulados por Nível**: Sistema estruturado de `Exame > Área de Conhecimento > Tópico > Nível`
- **🎮 Gamificação**: Sistema de medalhas, conquistas e streaks para motivar o aprendizado
- **🤖 Prof. Sabichão**: Nosso mascote e assistente inteligente para tirar dúvidas
- **📊 Feedback Detalhado**: Explicações específicas para cada alternativa e links de aprofundamento
- **🔐 Sistema de Autenticação**: Login seguro com NextAuth.js e proteção de rotas
- **📱 Interface Responsiva**: Design moderno que funciona em qualquer dispositivo
- **⚡ Performance**: Construído com Next.js 14 e otimizações modernas

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Ícones modernos
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Backend
- **Next.js API Routes** - Endpoints serverless
- **NextAuth.js** - Autenticação completa
- **Prisma** - ORM moderno para TypeScript
- **PostgreSQL** - Banco de dados relacional
- **bcryptjs** - Hash de senhas

### Infraestrutura
- **Docker** - Containerização do banco de dados
- **Docker Compose** - Orquestração de containers

#### Stack Resumido
- **Frontend:** React, Next.js, TypeScript
- **Estilização:** Tailwind CSS
- **Banco de Dados:** PostgreSQL

## 🗂️ Estrutura do Projeto

```
aprovaai/
├── src/
│   ├── app/                    # App Router do Next.js
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Autenticação NextAuth.js
│   │   │   └── register/      # Endpoint de registro
│   │   ├── dashboard/         # Área do usuário
│   │   ├── login/            # Página de login
│   │   ├── register/         # Página de cadastro
│   │   └── globals.css       # Estilos globais
│   ├── components/           # Componentes React
│   │   ├── auth/            # Componentes de autenticação
│   │   ├── layout/          # Layout e navegação
│   │   ├── providers/       # Providers (Session, etc.)
│   │   ├── sections/        # Seções da landing page
│   │   └── ui/              # Componentes de UI
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilitários e configurações
│   └── types/               # Definições de tipos TypeScript
├── prisma/                  # Schema do banco de dados
├── public/                  # Arquivos estáticos
├── docker-compose.yml       # Configuração do PostgreSQL
├── middleware.ts            # Middleware de autenticação
└── tailwind.config.js       # Configuração do Tailwind
```

## Planos de Acesso

O AprovaAI oferece dois planos para atender às suas necessidades de estudo:

**Free Tier:**
- Acesso limitado a certos conteúdos e níveis iniciais.
- Limitação de simulados: Período de espera de **6 horas** entre a realização de cada simulado.
- Acesso limitado ao chatbot Prof. Sabichão (futuramente).
- Pode conter anúncios.

**Premium:**
- Simulados ilimitados.
- Acesso ilimitado ao chatbot Prof. Sabichão (futuramente).
- Relatórios de desempenho detalhados (análise de pontos fortes/fracos, evolução por conteúdo).
- Acesso antecipado a novos conteúdos e exames.
- Questões exclusivas.
- Remoção de anúncios.
- Prioridade no suporte.

## Funcionalidades da Primeira Versão (MVP)

### Para o Usuário (Estudante):

  * **Simulados por Nível:** Faça simulados divididos por `Exame > Área de Conhecimento > Tópico > Nível`.
  * **Níveis de Dificuldade:** Cada nível oferece questões focadas naquele conteúdo.
  * **Simulado Diversificado:** O último nível de cada tópico apresenta questões mais variadas em dificuldade para consolidar o aprendizado.
  * **Tipos de Questões:** Questões de múltipla escolha, podendo ter uma ou duas alternativas corretas (com a necessidade de acertar todas as corretas para pontuar).
  * **Feedback Detalhado:**
      * **Geral:** Feedback imediato (`Certo/Errado`) após confirmar a resposta.
      * **Por Alternativa:** Explicações específicas abaixo de cada alternativa, detalhando o motivo de estar certa ou errada.
      * **Links para Aprofundamento:** Links opcionais para buscar mais conhecimento sobre o tema da questão.
  * **Gamificação e Conquistas:** Receba medalhas e distintivos por marcos como:
      * "Simulados Perfeitos" (100% de acertos).
      * "10 Dias Seguidos" (manter a streak de estudos).
      * "Maratonista de [Matéria]" (completar níveis de um conteúdo).
      * "Especialista [Exame]" (concluir todos os conteúdos de um exame).
      * "Primeira Conquista" e "Desafiante".
  * **Streak de Dias:** Visualize seu progresso contínuo de estudos através de um calendário ou contador.

### Para o Administrador (Perfil Root):

O perfil administrador/root possui controle total sobre o conteúdo da plataforma:

  * **Gerenciamento de Exames:**
      * **CRUD completo:** Cadastrar, atualizar e remover exames.
      * **Configuração de Exames:** Adicionar descrição, link para informações oficiais e, opcionalmente, a data da próxima prova (se aplicável ao tipo de exame, como ENEM; não exibido para exames sem data fixa, como AWS).
  * **Gerenciamento de Conteúdo:**
      * **CRUD completo:** Cadastrar, atualizar e remover `Áreas de Conhecimento`, `Tópicos` e `Níveis` dentro de cada exame.
      * **Personalização de Níveis:** Definir a quantidade de questões por nível e a quantidade de alternativas por questão.
      * **Critérios de Aprovação:** Configurar o número ou a porcentagem de acertos para passar de nível (com opção de "treino/revisão" sem critério de aprovação).
      * **Controle de Acesso:** Definir quais exames, áreas, tópicos ou níveis são acessíveis para usuários `Free Tier` ou apenas `Premium`.
  * **Gerenciamento de Questões:**
      * **CRUD completo:** Cadastrar, atualizar e remover questões.
      * **Configuração de Feedback:** Adicionar o feedback geral e as explicações por alternativa (ambos opcionais), além dos links de aprofundamento (opcional).
  * **Gerenciamento de Usuários:**
      * **CRUD de Planos:** Ativar/desativar planos, alterar tipos de plano (Free para Premium, vice-versa), e gerenciar assinaturas (data de início/expiração, suspensão).
      * **Moderação de Nomes/Nicks:** Moderação manual e filtro automático de palavras-chave ofensivas.

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ instalado
- Docker e Docker Compose instalados
- Git instalado

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/Raullize/aprovaai.git
   cd aprovaai
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` com suas configurações.

4. **Inicie o banco de dados PostgreSQL**
   ```bash
   docker-compose up -d
   ```

5. **Configure o banco de dados**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

6. **Popule o banco com dados iniciais (opcional)**
   ```bash
   npm run db:seed
   ```
   Isso criará:
   - Usuário administrador: `admin@aprovaai.com` / `admin123`
   - Usuário demo: `demo@aprovaai.com` / `demo123`
   
   Para mais informações sobre seeders, consulte [SEEDERS.md](SEEDERS.md)

7. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

8. **Acesse a aplicação**
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run db:push` - Aplica mudanças no schema do banco
- `npm run db:studio` - Abre o Prisma Studio
- `npm run db:seed` - Popula o banco com dados iniciais
- `npm run db:seed:cleanup` - Remove dados dos seeders

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 👥 Equipe do Projeto

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Raullize">
        <img src="https://github.com/Raullize.png" width="100px;" alt="Raul Lize"/><br />
        <sub><b>Raul Lize Teixeira</b></sub>
      </a><br />
      <sub>Desenvolvedor</sub>
    </td>
    <td align="center">
      <a href="https://github.com/MiguelLewandowski">
        <img src="https://github.com/MiguelLewandowski.png" width="100px;" alt="Miguel Leonardo"/><br />
        <sub><b>Miguel Leonardo Strapazon Lewandowski</b></sub>
      </a><br />
      <sub>Desenvolvedor</sub>
    </td>
    <td align="center">
      <a href="https://github.com/EverttonFernandes">
        <img src="https://github.com/EverttonFernandes.png" width="100px;" alt="Everton Fernandes"/><br />
        <sub><b>Everton Oliveira Fernandes</b></sub>
      </a><br />
      <sub>Professor Orientador</sub>
    </td>
  </tr>
</table>

## 🎯 Roadmap

- [x] Sistema de autenticação completo
- [x] Landing page responsiva
- [ ] Dashboard do admin
- [ ] Dashboard do usuário
- [ ] Sistema de simulados
- [ ] Gamificação e conquistas
- [ ] Integração com IA (Prof. Sabichão)
- [ ] Sistema de pagamentos
- [ ] Aplicativo mobile
- [ ] Ranqueamento
- [ ] Página de Blog/Comunidade

---

<div align="center">
  Desenvolvido com ❤️ 
</div>
