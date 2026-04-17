import { ReorderQuestionsUseCase } from '../../reorder-questions.use-case';
import { InMemoryQuestionRepository } from '../../../../../../test/repositories/in-memory-question.repository';
import { Question } from '../../../../../domain/content/entities/question.entity';

describe('ReorderQuestionsUseCase', () => {
  let useCase: ReorderQuestionsUseCase;
  let repository: InMemoryQuestionRepository;

  beforeEach(() => {
    repository = new InMemoryQuestionRepository();
    useCase = new ReorderQuestionsUseCase(repository);
  });

  it('should reorder questions according to the given ids array', async () => {
    const qA = Question.create({
      content: 'Question A?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 0,
    });
    const qB = Question.create({
      content: 'Question B?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 1,
    });
    const qC = Question.create({
      content: 'Question C?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 2,
    });

    await repository.create(qA);
    await repository.create(qB);
    await repository.create(qC);

    // Reverse: C, A, B
    await useCase.execute({ ids: [qC.id, qA.id, qB.id] });

    const reordered = await repository.findByLevelId('level-01');

    expect(reordered[0].id).toBe(qC.id);
    expect(reordered[1].id).toBe(qA.id);
    expect(reordered[2].id).toBe(qB.id);
  });

  it('should assign correct numeric order values (0-indexed)', async () => {
    const qA = Question.create({
      content: 'Q A?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 0,
    });
    const qB = Question.create({
      content: 'Q B?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 1,
    });

    await repository.create(qA);
    await repository.create(qB);

    await useCase.execute({ ids: [qB.id, qA.id] });

    const qBAfter = repository.items.find((q) => q.id === qB.id)!;
    const qAAfter = repository.items.find((q) => q.id === qA.id)!;

    expect(qBAfter.order).toBe(0);
    expect(qAAfter.order).toBe(1);
  });
});
