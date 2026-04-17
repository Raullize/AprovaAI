import { FindQuestionsByLevelIdUseCase } from '../../find-questions-by-level-id.use-case';
import { InMemoryQuestionRepository } from '../../../../../../test/repositories/in-memory-question.repository';
import { Question } from '../../../../../domain/content/entities/question.entity';

describe('FindQuestionsByLevelIdUseCase', () => {
  let useCase: FindQuestionsByLevelIdUseCase;
  let repository: InMemoryQuestionRepository;

  beforeEach(() => {
    repository = new InMemoryQuestionRepository();
    useCase = new FindQuestionsByLevelIdUseCase(repository);
  });

  it('should return all questions belonging to a given level', async () => {
    const qA = Question.create({
      content: 'Question A?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 0,
    });
    const qB = Question.create({
      content: 'Question B?',
      type: 'MULTIPLE_CHOICE',
      levelId: 'level-01',
      order: 1,
    });
    const qOther = Question.create({
      content: 'Question Other Level?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-02',
      order: 0,
    });

    await repository.create(qA);
    await repository.create(qB);
    await repository.create(qOther);

    const result = await useCase.execute('level-01');

    expect(result).toHaveLength(2);
    expect(result.every((q) => q.levelId === 'level-01')).toBe(true);
  });

  it('should return questions sorted by order', async () => {
    const qB = Question.create({
      content: 'Question B?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 1,
    });
    const qA = Question.create({
      content: 'Question A?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 0,
    });

    // Insert in "wrong" order
    await repository.create(qB);
    await repository.create(qA);

    const result = await useCase.execute('level-01');

    expect(result[0].id).toBe(qA.id);
    expect(result[1].id).toBe(qB.id);
  });

  it('should return an empty array when no questions belong to the level', async () => {
    const result = await useCase.execute('level-not-found');

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });
});
