import { DeleteQuestionUseCase } from '../../delete-question.use-case';
import { InMemoryQuestionRepository } from '../../../../../../test/repositories/in-memory-question.repository';
import { Question } from '../../../../../domain/content/entities/question.entity';

describe('DeleteQuestionUseCase', () => {
  let useCase: DeleteQuestionUseCase;
  let repository: InMemoryQuestionRepository;

  beforeEach(() => {
    repository = new InMemoryQuestionRepository();
    useCase = new DeleteQuestionUseCase(repository);
  });

  it('should be able to delete a question', async () => {
    const question = Question.create({
      content: 'Question to delete?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 0,
    });
    await repository.create(question);

    expect(repository.items).toHaveLength(1);

    await useCase.execute(question.id);

    expect(repository.items).toHaveLength(0);
  });

  it('should not throw when deleting a non-existing question', async () => {
    await expect(useCase.execute('non-existing-id')).resolves.not.toThrow();
  });

  it('should only delete the target question, leaving others intact', async () => {
    const questionA = Question.create({
      content: 'Question A?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 0,
    });
    const questionB = Question.create({
      content: 'Question B?',
      type: 'MULTIPLE_CHOICE',
      levelId: 'level-01',
      order: 1,
    });
    await repository.create(questionA);
    await repository.create(questionB);

    await useCase.execute(questionA.id);

    expect(repository.items).toHaveLength(1);
    expect(repository.items[0].id).toBe(questionB.id);
  });
});
