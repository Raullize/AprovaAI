# AprovaAI

![AprovaAI Logo](placeholder-mascot-link)
*Prof. Sabichão - Seu assistente inteligente*

## 🚀 Landing Page Desenvolvida

A landing page do AprovaAI foi desenvolvida com tecnologias modernas e está pronta para uso!

### 📚 Documentação Técnica
Para informações detalhadas sobre desenvolvimento e configuração, consulte a **[documentação técnica completa](./docs/)**.

**Acesso rápido:**
- **[Setup Inicial](./docs/SETUP-CHECKLIST.md)** - Lista de configuração
- **[Guia de Imagens](./docs/GUIA-IMAGENS.md)** - Prof. Sabichão, logo e favicon

## Sobre o AprovaAI

O **AprovaAI** é uma plataforma inovadora de estudos focada em auxiliar estudantes na preparação para diversos tipos de exames, desde vestibulares tradicionais (como ENEM, ITA) até certificações profissionais (como AWS). Inspirado em uma metodologia de aprendizado por níveis e gamificação, o AprovaAI oferece simulados personalizados, feedback detalhado e acompanhamento de desempenho para otimizar a jornada de estudo do usuário. Nosso mascote e assistente inteligente é o **Prof. Sabichão**, que futuramente estará disponível para tirar dúvidas.

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

## Planos de Acesso

O AprovaAI oferece dois planos para atender às suas necessidades de estudo:

1.  **Free Tier:**
      * Acesso limitado a certos conteúdos e níveis iniciais.
      * Limitação de simulados: Período de espera de **6 horas** entre a realização de cada simulado.
      * Acesso limitado ao chatbot Prof. Sabichão (futuramente).
      * Pode conter anúncios.
2.  **Premium:**
      * Simulados ilimitados.
      * Acesso ilimitado ao chatbot Prof. Sabichão (futuramente).
      * Relatórios de desempenho detalhados (análise de pontos fortes/fracos, evolução por conteúdo).
      * Acesso antecipado a novos conteúdos e exames.
      * Questões exclusivas.
      * Remoção de anúncios.
      * Prioridade no suporte.

## Tecnologias Utilizadas (Stack)

  * **Frontend:** React, Next.js, TypeScript
  * **Estilização:** Tailwind CSS
  * **Banco de Dados:** PostgreSQL

## Funcionalidades Futuras (Em Desenvolvimento)

  * **Chatbot com IA (Prof. Sabichão):** O assistente inteligente para tirar dúvidas estará disponível para usuários Premium.
  * **Ranqueamento:** Um sistema de ranqueamento global e/ou por amigos será implementado para fomentar a competição saudável.
  * **Página de Blog/Comunidade:** Um espaço para usuários publicarem, compartilharem conhecimento e interagirem, facilitando a troca de informações e o esclarecimento de dúvidas entre a comunidade.
