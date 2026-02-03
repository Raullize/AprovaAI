> Este README serve como referência para o projeto AprovaAI. Como a aplicação está em fase de desenvolvimento, algumas características descritas aqui podem ser alteradas ou ajustadas ao longo do tempo.

<h1 align="center">AprovaAI</h1>

<p align="center">
  <img src="http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white"/>
</p>

<p align="center">
  <img src="public/images/prof-sabichao.png" alt="AprovaAI Logo" width="200" />
</p>

## Descrição

O **AprovaAI** é uma plataforma inovadora de estudos focada em auxiliar estudantes na preparação para diversos tipos de exames, desde vestibulares tradicionais (como ENEM, ITA) até certificações profissionais (como AWS). Inspirado em uma metodologia de aprendizado por níveis e gamificação, o AprovaAI oferece simulados personalizados, feedback detalhado e acompanhamento de desempenho para otimizar a jornada de estudo do usuário.

### Características Principais

- **Simulados por Nível**: Sistema estruturado de `Exame > Tópico > Nível > Questões`
- **Gamificação**: Sistema de medalhas, conquistas e streaks para motivar o aprendizado
- **Prof. Sabichão**: Nosso mascote e assistente inteligente para tirar dúvidas
- **Feedback Detalhado**: Explicações específicas para cada alternativa e links de aprofundamento
- **Sistema de Autenticação**: Login seguro com NextAuth.js e proteção de rotas
- **Interface Responsiva**: Design moderno que funciona em qualquer dispositivo
- **Performance**: Construído com Next.js 14 e otimizações modernas

## Tecnologias Utilizadas

- Detalhar...

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

  * **Simulados por Nível:** Faça simulados divididos por `Exame > Tópico > Nível > Questões`.
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
      * **CRUD completo:** Cadastrar, atualizar e remover `Tópico, Nível e Questões` dentro de cada exame.
      * **Personalização de Níveis:** Definir a quantidade de questões por nível e a quantidade de alternativas por questão.
      * **Critérios de Aprovação:** Configurar o número ou a porcentagem de acertos para passar de nível (com opção de "treino/revisão" sem critério de aprovação).
      * **Controle de Acesso:** Definir quais exames, áreas, tópicos ou níveis são acessíveis para usuários `Free Tier` ou apenas `Premium`.
  * **Gerenciamento de Questões:**
      * **CRUD completo:** Cadastrar, atualizar e remover questões.
      * **Configuração de Feedback:** Adicionar o feedback geral e as explicações por alternativa (ambos opcionais), além dos links de aprofundamento (opcional).
  * **Gerenciamento de Usuários:**
      * **CRUD de Planos:** Ativar/desativar planos, alterar tipos de plano (Free para Premium, vice-versa), e gerenciar assinaturas (data de início/expiração, suspensão).
      * **Moderação de Nomes/Nicks:** Moderação manual e filtro automático de palavras-chave ofensivas.

## Como Executar o Projeto

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
   
   Para mais informações sobre seeders, consulte **[SEEDERS.md](SEEDERS.md)**

7. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

8. **Acesse a aplicação**
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.
   
   **Links úteis:**
   - **API Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health) *(teste no Insomnia/Postman ou navegador)*

## Como Rodar o Docker no Linux

1. Certifique-se de que o Docker e o Docker Compose estão instalados:
   ```bash
   docker --version
   docker compose version
   ```
   Se não estiverem instalados, siga as instruções em https://docs.docker.com/engine/install/ e https://docs.docker.com/compose/install/.

2. Certifique-se de que o serviço Docker está em execução. Caso não esteja, inicie com:
   ```bash
   sudo systemctl start docker
   ```

3. Para iniciar o banco de dados PostgreSQL:
   ```bash
   docker-compose up -d
   ```
   Isso criará e executará os containers necessários em segundo plano.

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run db:push` - Aplica mudanças no schema do banco
- `npm run db:studio` - Abre o Prisma Studio
- `npm run db:seed` - Popula o banco com dados iniciais
- `npm run db:seed:cleanup` - Remove dados dos seeders

## Documentação
- [Seeders](./docs/SEEDERS.md)

## Contribuição

Contribuições são sempre bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Equipe do Projeto

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
