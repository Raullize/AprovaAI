export interface AttemptContextQuestion {
  number: number;
  content: string;
  selectedOptions: string[];
  correctOptions: string[];
  isCorrect: boolean | null;
  explanation?: string | null;
  studyLink?: string | null;
}

export interface AttemptContext {
  simulationName: string;
  examName?: string | null;
  topicName?: string | null;
  mode: 'PRACTICE' | 'EXAM';
  score: number;
  totalQuestions: number;
  percentage?: number | null;
  passed?: boolean | null;
  stars?: number | null;
  timeSpentSeconds?: number | null;
  questions: AttemptContextQuestion[];
}

export const ATTEMPT_CONTEXT_MAX_QUESTIONS = 10;

const CONTENT_MAX_LENGTH = 700;
const EXPLANATION_MAX_LENGTH = 500;

function truncate(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength).trimEnd()}...`
    : normalized;
}

function formatDuration(seconds?: number | null): string | null {
  if (seconds === null || seconds === undefined || seconds <= 0) {
    return null;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}min ${remainingSeconds}s`;
}

function formatOptions(options: string[]): string {
  if (options.length === 0) {
    return 'não respondida';
  }

  return options.map((option) => `"${option}"`).join(' e ');
}

function formatQuestion(question: AttemptContextQuestion): string {
  const status = question.isCorrect === false ? '[ERROU]' : '[ACERTOU]';
  const lines = [
    `${question.number}. ${status} ${truncate(question.content, CONTENT_MAX_LENGTH)}`,
    `   Marcada: ${formatOptions(question.selectedOptions)}`,
    `   Correta: ${formatOptions(question.correctOptions)}`,
  ];

  if (question.explanation) {
    lines.push(
      `   Explicação: ${truncate(question.explanation, EXPLANATION_MAX_LENGTH)}`,
    );
  }

  if (question.studyLink) {
    lines.push(`   Link de estudo: ${question.studyLink}`);
  }

  return lines.join('\n');
}

export function buildAttemptContextSection(context: AttemptContext): string {
  const details: string[] = [`- Simulado: ${context.simulationName}`];

  if (context.examName) {
    details.push(`- Exame: ${context.examName}`);
  }

  if (context.topicName) {
    details.push(`- Tópico: ${context.topicName}`);
  }

  details.push(
    `- Modo: ${context.mode === 'PRACTICE' ? 'Treino (feedback imediato)' : 'Exame'}`,
  );

  const percentage =
    context.percentage !== null && context.percentage !== undefined
      ? ` (${Math.round(context.percentage)}%)`
      : '';
  const outcome =
    context.passed === true
      ? 'aprovado'
      : context.passed === false
        ? 'não aprovado'
        : 'sem status de aprovação';
  const stars =
    context.stars !== null && context.stars !== undefined
      ? ` — ${context.stars} estrela(s)`
      : '';

  details.push(
    `- Desempenho: ${context.score} de ${context.totalQuestions} acertos${percentage} — ${outcome}${stars}`,
  );

  const duration = formatDuration(context.timeSpentSeconds);
  if (duration) {
    details.push(`- Tempo gasto: ${duration}`);
  }

  const prioritized = [...context.questions].sort((a, b) => {
    if (a.isCorrect === b.isCorrect) {
      return a.number - b.number;
    }
    return a.isCorrect === false ? -1 : 1;
  });
  const included = prioritized.slice(0, ATTEMPT_CONTEXT_MAX_QUESTIONS);
  const omitted = prioritized.length - included.length;

  const questionLines =
    included.length > 0
      ? included.map(formatQuestion).join('\n\n')
      : 'Nenhuma resposta registrada nesta tentativa.';

  const omittedNote =
    omitted > 0
      ? `\n\n(As demais ${omitted} questão(ões) foram omitidas por limite de contexto.)`
      : '';

  return `
## Contexto desta tentativa (dados reais)

Você está conversando sobre uma tentativa de simulado já concluída por este
aluno. Use exclusivamente os dados abaixo para responder. Cite a questão pelo
número quando fizer referência a ela. Não invente acertos, notas, alternativas
ou explicações, e não revele gabaritos de outros simulados.

${details.join('\n')}

### Questões da tentativa (erros primeiro)

${questionLines}${omittedNote}`;
}
