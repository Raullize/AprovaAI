import { FindQuestionByIdUseCase } from '../../find-question-by-id.use-case';
import { InMemoryQuestionRepository } from '../../../../../../test/repositories/in-memory-question.repository';
import { Question } from '../../../../../domain/content/entities/question.entity';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('FindQuestionByIdUseCase', () => {
  let useCase: FindQuestionByIdUseCase;
  let repository: InMemoryQuestionRepository;

  beforeEach(() => {
    repository = new InMemoryQuestionRepository();
    useCase = new FindQuestionByIdUseCase(repository);
  });

  it('should return a question when it exists', async () => {
    const question = Question.create({
      content: 'What is TypeScript?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 0,
      options: [
        { text: 'A typed JavaScript superset', isCorrect: true, order: 0 },
        { text: 'A database', isCorrect: false, order: 1 },
      ],
    });
    await repository.create(question);

    const found = await useCase.execute(question.id);

    expect(found.id).toBe(question.id);
    expect(found.content).toBe('What is TypeScript?');
    expect(found.options).toHaveLength(2);
  });

  it('should throw ResourceNotFoundError when question does not exist', async () => {
    await expect(useCase.execute('non-existing-id')).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });

  it('should throw ResourceNotFoundError with the correct identifier in the message', async () => {
    await expect(useCase.execute('bad-id')).rejects.toThrow(
      "Question with identifier 'bad-id' not found",
    );
  });
});
