/**
 * Base de conhecimento do AprovaAI voltada ao estudante.
 *
 * Deve conter apenas fatos do lado do aluno (nunca do fluxo administrativo).
 * É injetada no system prompt do Professor Sabichão.
 */
export const PLATFORM_KNOWLEDGE = `
## O que é o AprovaAI
O AprovaAI é uma plataforma de estudos gamificada para preparação de exames
(ENEM, concursos, certificações, vestibular e OAB). O conteúdo é organizado em
trilhas com a hierarquia: Exame -> Tópico -> Simulado -> Questões.

## Navegação do estudante (menu lateral)
- Início: painel com XP total, nível, ofensiva (streak), posição no ranking e
  número de simulados realizados; também mostra os exames disponíveis.
- Explorar: catálogo de exames com busca, filtro por categoria e opção de
  favoritar (estrela). Ao abrir um exame, aparece o modal "Detalhes do Exame"
  com descrição, quantidade de tópicos, status e o modo da trilha (em ordem ou
  livre).
- Simulados: histórico de tentativas (em andamento e concluídas), com nota,
  estrelas, tempo e filtros; permite ver o resultado e a revisão.
- Ranking: ranking global por XP e por ofensiva.
- Perfil: dados do usuário. Em "Editar Perfil" é possível atualizar os dados e
  a senha; em "Minhas Conquistas" ficam as conquistas desbloqueadas e
  bloqueadas.
- Ferramentas de estudo: botão flutuante no canto inferior direito da tela, com
  Pomodoro, Anotações e o Professor Sabichão (este chat).

## Trilha de aprendizagem
- Cada exame possui tópicos e cada tópico possui simulados exibidos como nós.
- Estados dos nós: bloqueado, disponível (o próximo) e concluído.
- Modo "em ordem" (padrão): é preciso concluir/aprovar o simulado anterior para
  liberar o próximo.
- Modo "livre": o exame pode ser configurado para permitir escolher qualquer
  simulado, sem seguir a ordem.
- O modo da trilha é informado no modal "Detalhes do Exame".
- As estrelas (0 a 3) indicam o desempenho em cada simulado concluído.

## Simulados
- Modo Treino (PRACTICE): feedback imediato após cada resposta, com gabarito,
  explicação e link de estudo.
- Modo Exame (EXAM): sem feedback durante o simulado; o resultado e o gabarito
  aparecem ao final.
- Pode haver cronômetro (tempo limite); quando o tempo zera, a tentativa é
  finalizada.
- É possível marcar questões para revisar.
- Ao finalizar, o sistema calcula nota percentual, aprovado/reprovado conforme a
  meta do simulado, estrelas, XP e tempo.
- Tela de resultados: mostra nota, estrelas, XP e tempo, com acesso à revisão.
- Revisão: lista as questões com a resposta do aluno, a alternativa correta, a
  explicação e o link de estudo.
- É possível refazer um simulado. O XP considera apenas a melhoria em relação ao
  melhor desempenho anterior.

## Gamificação
- XP: acumulado ao concluir simulados. O nível sobe a cada 100 XP.
- Estrelas: de 0 a 3 por simulado, conforme o desempenho.
- Ofensiva (streak): dias consecutivos de estudo. Concluir um simulado no dia
  registra a atividade.
- Conquistas: disponíveis em "Minhas Conquistas".
- Ranking: global, por XP e por ofensiva.
- Favoritos: estrela nos cartões de exame para fixar trilhas.

## Categorias de exame
Concursos, Certificações, Vestibular, OAB e Outros.

## Dicas de uso
- Para começar: Explorar -> escolher um exame -> abrir a trilha -> iniciar o
  simulado disponível.
- Para revisar erros: Simulados -> abrir uma tentativa concluída -> Revisão.
- Para acompanhar o progresso: Início (XP e ofensiva) e Ranking.
- Para organizar os estudos: use o Pomodoro e as Anotações nas Ferramentas de
  estudo.
`;
