# BUSINESS_RULES (BDD) — AprovaAI

Este documento descreve regras de negocio e comportamentos esperados (BDD) do AprovaAI em linguagem de produto, servindo como:

- Referencia para discussao com orientacao/banca do TCC
- Base para testes (unitarios e integracao)
- Contrato de comportamento entre frontend e backend

Quando um cenario estiver descrito aqui e nao houver teste cobrindo o comportamento, ele deve ser priorizado. Quando um cenario estiver marcado como "Pendente", significa que o comportamento ainda nao esta garantido pela implementacao atual.

---

## Linguagem do dominio

- **Content (Conteudo):** Exam, Topic, Simulation, Question
- **Exam (Trilha):** Agrupador principal (ex.: "AWS Cloud Practitioner")
- **Topic (Topico):** Subdivisao do Exam
- **Simulation (Simulado):** Unidade executavel de simulado (possui modo, tempo e regras de aprovação)
- **Question (Questao):** Item respondido durante o simulado
- **Simulation (Simulado):** Execucao de um Simulation por um usuario
- **SimulationAttempt (Resultado):** Registro do simulado (IN_PROGRESS/COMPLETED) com respostas e metricas

---

## Autenticacao e sessoes

### Cenario: Login bem sucedido
**Status:** Implementado

- Dado que existe um usuario cadastrado com email e senha validos
- Quando ele realiza login
- Entao o backend deve retornar um JWT
- E o frontend deve persistir o JWT no `localStorage`

### Cenario: Logout
**Status:** Implementado (frontend)

- Dado que o usuario possui um JWT salvo no `localStorage`
- Quando ele faz logout
- Entao o frontend deve remover o token do `localStorage`
- E o usuario nao deve conseguir acessar rotas protegidas

---

## Conta (autoatendimento)

### Cenario: Atualizar dados do proprio perfil
**Status:** Implementado

- Dado que o usuario esta autenticado
- Quando ele atualiza seu nome/username (e dados permitidos)
- Entao o sistema deve persistir a mudanca
- E a operacao deve funcionar para perfis ADMIN e USER

### Cenario: Atualizar senha
**Status:** Implementado

- Dado que o usuario esta autenticado
- Quando ele informa a senha atual correta e uma nova senha valida
- Entao o sistema deve substituir o hash de senha
- E o usuario deve conseguir autenticar com a nova senha

---

## Admin: Conteudo (CRUD)

### Regra: Slug deve ser valido
**Status:** Implementado

- Um slug deve conter apenas letras minusculas, numeros e hifen, sem espacos
- Se um slug for invalido, o backend deve rejeitar a operacao

### Cenario: Criar Exam/Topic/Simulation gerando slug automaticamente
**Status:** Implementado

- Dado que um admin envia um nome para criar um Exam/Topic/Simulation
- Quando o nome e recebido pelo backend
- Entao o sistema deve gerar um slug a partir do nome
- E se ja existir conflito, deve gerar um slug unico (ex.: `meu-exame`, `meu-exame-1`, `meu-exame-2`)

### Cenario: Atualizar nome e regenerar slug de forma segura
**Status:** Implementado

- Dado que existe um Exam/Topic/Simulation
- Quando o admin altera o nome
- Entao o sistema deve recalcular o slug a partir do novo nome
- E deve evitar colisao com slugs de outros registros do mesmo escopo

### Cenario: Concorrencia na criacao de slugs (dois admins ao mesmo tempo)
**Status:** Implementado (Tratado pelo DomainExceptionFilter)

- Dado que dois requests concorrentes geram o mesmo slug
- Quando ambos tentam persistir no banco
- Entao o sistema deve responder com um erro de conflito (ex.: HTTP 409)
- E nao deve retornar HTTP 500 generico

---

## Admin: Reordenacao (Drag & Drop)

### Cenario: Reordenar Exams/Topics/Simulations/Questions
**Status:** Implementado (caminho feliz)

- Dado que existem itens com uma ordem atual
- Quando o admin envia um array de ids na nova sequencia
- Entao o sistema deve atualizar o campo `order` para refletir a sequencia (0-indexado)

### Cenario: Reordenacao invalida (ids duplicados, faltando ou inexistentes)
**Status:** Implementado (Validação no UseCase lançando InvalidReorderError)

- Dado que existe uma lista de itens reordenaveis
- Quando o admin envia ids duplicados, ids faltando ou ids que nao existem
- Entao o sistema deve rejeitar com HTTP 400 e uma mensagem de reordenacao invalida
- E nenhuma alteracao parcial deve ser persistida

---

## Aluno: Execucao de Simulados

### Cenario: Iniciar simulado em um Simulation sem questões
**Status:** Implementado

- Dado que existe um Simulation com 0 questões
- Quando o aluno tenta iniciar um simulado desse Simulation
- Entao o sistema deve rejeitar a operacao

### Cenario: Retomar simulado em andamento
**Status:** Implementado

- Dado que o aluno ja possui um simulado IN_PROGRESS para um Simulation
- Quando ele tenta iniciar novamente o simulado do mesmo Simulation
- Entao o sistema deve retornar o simulado existente (retomar)

### Cenario: Salvar resposta em simulado de outro usuario
**Status:** Implementado

- Dado que existe um SimulationAttempt que pertence a outro usuario
- Quando um usuario tenta salvar resposta nesse SimulationAttempt
- Entao o sistema deve rejeitar a operacao

### Cenario: Salvar resposta de questao fora do Simulation do simulado
**Status:** Implementado

- Dado que o simulado esta associado ao Simulation X
- Quando o aluno tenta responder uma questao do Simulation Y
- Entao o sistema deve rejeitar a operacao

### Cenario: Feedback imediato (modo PRACTICE)
**Status:** Implementado

- Dado que o simulado esta no modo PRACTICE
- Quando o aluno salva uma resposta
- Entao o backend deve retornar se a resposta esta correta (`isCorrect`)

### Cenario: Sem feedback imediato (modo EXAM)
**Status:** Implementado

- Dado que o simulado esta no modo EXAM
- Quando o aluno salva uma resposta
- Entao o backend nao deve retornar se a resposta esta correta (oculta ate finalizar)

### Cenario: Finalizar simulado e calcular resultado
**Status:** Implementado

- Dado que o simulado esta IN_PROGRESS
- Quando o aluno finaliza o simulado
- Entao o sistema deve calcular:
  - quantidade de acertos
  - percentual
  - aprovado/reprovado (comparando com `passingPercentage`)
  - estrelas (0 a 3)
- E deve persistir o SimulationAttempt como COMPLETED

### Regra: XP ganho por melhoria em relacao ao melhor desempenho anterior
**Status:** Implementado

- Dado que o aluno ja possui tentativas COMPLETED para o mesmo Simulation
- Quando ele finaliza uma nova tentativa
- Entao o XP ganho deve considerar apenas o delta de estrelas (melhoria) sobre a melhor tentativa anterior
- E se nao houver melhoria, o XP ganho deve ser 0

### Regra: Ofensiva (streak) e atividade diaria
**Status:** Implementado

- Dado que o aluno concluiu um simulado hoje
- Quando o simulado e finalizado
- Entao o sistema deve registrar atividade do dia
- E atualizar a streak do usuario conforme a data atual

---

## Historico

### Cenario: Listar historico de simulados
**Status:** Implementado

- Dado que o usuario esta autenticado
- Quando ele solicita o historico
- Entao o sistema deve retornar simulados em andamento e concluidos do usuario

---

## Erros e contratos HTTP

### Regra: Erros de dominio devem virar resposta HTTP coerente
**Status:** Implementado (parcial)

- Quando uma regra de negocio falhar e for lancado um `AppError`
- Entao o backend deve retornar `statusCode`, `message` e `error`
- Quando ocorrer erro de infraestrutura nao tratado
- Entao o backend nao deve expor detalhes sensiveis e deve retornar 500 generico

### Regra: Erros de infraestrutura relevantes devem ser mapeados
**Status:** Implementado

- Conflito de unicidade no banco (ex.: slug/email mapeado para 409 Conflict)
- Reordenacao invalida (ex.: InvalidReorderError garantindo 400 Bad Request)

