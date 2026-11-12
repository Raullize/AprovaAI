import {
  ATTEMPT_CONTEXT_MAX_QUESTIONS,
  buildAttemptContextSection,
  AttemptContext,
} from '../../attempt-context.prompt';

function buildContext(overrides: Partial<AttemptContext> = {}): AttemptContext {
  return {
    simulationName: 'Simulado ENEM',
    examName: 'ENEM',
    topicName: 'Matemática',
    mode: 'PRACTICE',
    score: 1,
    totalQuestions: 2,
    percentage: 50,
    passed: false,
    stars: 1,
    timeSpentSeconds: 125,
    questions: [
      {
        number: 1,
        content: 'Questão sobre funções',
        selectedOptions: ['Alternativa errada'],
        correctOptions: ['Alternativa correta'],
        isCorrect: false,
        explanation: 'Resolução da questão',
        studyLink: 'https://study.test/funcoes',
      },
      {
        number: 2,
        content: 'Questão sobre geometria',
        selectedOptions: ['Alternativa correta'],
        correctOptions: ['Alternativa correta'],
        isCorrect: true,
      },
    ],
    ...overrides,
  };
}

describe('buildAttemptContextSection', () => {
  it('should describe the attempt summary and questions', () => {
    const section = buildAttemptContextSection(buildContext());

    expect(section).toContain('Contexto desta tentativa');
    expect(section).toContain('Simulado: Simulado ENEM');
    expect(section).toContain('Exame: ENEM');
    expect(section).toContain('Tópico: Matemática');
    expect(section).toContain('1 de 2 acertos (50%)');
    expect(section).toContain('não aprovado');
    expect(section).toContain('1 estrela(s)');
    expect(section).toContain('2min 5s');
    expect(section).toContain('[ERROU] Questão sobre funções');
    expect(section).toContain('Marcada: "Alternativa errada"');
    expect(section).toContain('Correta: "Alternativa correta"');
    expect(section).toContain('Explicação: Resolução da questão');
    expect(section).toContain('Link de estudo: https://study.test/funcoes');
    expect(section).toContain('[ACERTOU] Questão sobre geometria');
  });

  it('should prioritize wrong questions and respect the context limit', () => {
    const questions = Array.from(
      { length: ATTEMPT_CONTEXT_MAX_QUESTIONS + 2 },
      (_, index) => ({
        number: index + 1,
        content: `Questão ${index + 1}`,
        selectedOptions: ['A'],
        correctOptions: ['B'],
        isCorrect: index >= 2,
      }),
    );

    const section = buildAttemptContextSection(
      buildContext({ questions, totalQuestions: questions.length }),
    );

    expect(section).toContain('[ERROU] Questão 1');
    expect(section).toContain('[ERROU] Questão 2');
    expect(section).not.toContain('Questão 12');
    expect(section).toContain('2 questão(ões) foram omitidas');
  });

  it('should handle attempts without answers', () => {
    const section = buildAttemptContextSection(
      buildContext({
        questions: [],
        score: 0,
        totalQuestions: 0,
        percentage: null,
        passed: null,
        stars: null,
        timeSpentSeconds: null,
      }),
    );

    expect(section).toContain('Nenhuma resposta registrada');
    expect(section).not.toContain('Tempo gasto');
  });
});
