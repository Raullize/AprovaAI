import { FindAllQuestionsUseCase } from '../../find-all-questions.use-case';
import { InMemoryQuestionRepository } from '../../../../../../test/repositories/in-memory-question.repository';
import { Question } from '../../../../../domain/content/entities/question.entity';

describe('FindAllQuestionsUseCase', () => {
  let useCase: FindAllQuestionsUseCase;
  let repository: InMemoryQuestionRepository;

  beforeEach(() => {
    repository = new InMemoryQuestionRepository();
    useCase = new FindAllQuestionsUseCase(repository);
  });

  it('should return all questions from the repository', async () => {
    const qA = Question.create({
      content: 'Question A?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 0,
    });
    const qB = Question.create({
      content: 'Question B?',
      type: 'MULTIPLE_CHOICE',
      levelId: 'level-02',
      order: 0,
    });

    await repository.create(qA);
    await repository.create(qB);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result.map((q) => q.id)).toContain(qA.id);
    expect(result.map((q) => q.id)).toContain(qB.id);
  });

  it('should return an empty array when there are no questions', async () => {
    const result = await useCase.execute();

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });
});
