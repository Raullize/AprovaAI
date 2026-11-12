import {
  EnemQuestion,
  EnemQuestionBank,
  EnemQuestionFilter,
} from '../../application/content/ports/enem-question-bank';

export class FakeEnemQuestionBank extends EnemQuestionBank {
  fetchQuestions(filter: EnemQuestionFilter): Promise<EnemQuestion[]> {
    const total = Math.min(filter.limit, 10);
    const year = filter.years[0] ?? 2023;

    return Promise.resolve(
      Array.from({ length: total }, (_, index) => ({
        sourceRef: `enem:${year}:${index + 1}`,
        year,
        index: index + 1,
        discipline: filter.discipline,
        language: filter.language ?? null,
        content: `Questão ${index + 1} de ${filter.discipline} — ENEM ${year} (demo)`,
        options: [
          { text: 'Alternativa A', isCorrect: false },
          { text: 'Alternativa B', isCorrect: true },
          { text: 'Alternativa C', isCorrect: false },
          { text: 'Alternativa D', isCorrect: false },
          { text: 'Alternativa E', isCorrect: false },
        ],
      })),
    );
  }
}
