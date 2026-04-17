import { UpdateQuestionUseCase } from '../../update-question.use-case';
import { InMemoryQuestionRepository } from '../../../../../../test/repositories/in-memory-question.repository';
import { Question } from '../../../../../domain/content/entities/question.entity';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('UpdateQuestionUseCase', () => {
  let useCase: UpdateQuestionUseCase;
  let repository: InMemoryQuestionRepository;

  beforeEach(() => {
    repository = new InMemoryQuestionRepository();
    useCase = new UpdateQuestionUseCase(repository);
  });

  it('should be able to update a question content and type', async () => {
    const question = Question.create({
      content: 'Old content?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 0,
      options: [{ text: 'Option A', isCorrect: true, order: 0 }],
    });
    await repository.create(question);

    const updated = await useCase.execute({
      id: question.id,
      data: {
        content: 'New content?',
        type: 'MULTIPLE_CHOICE',
      },
    });

    expect(updated.content).toBe('New content?');
    expect(updated.type).toBe('MULTIPLE_CHOICE');
    expect(repository.items[0].content).toBe('New content?');
  });

  it('should be able to update options', async () => {
    const question = Question.create({
      content: 'How many sides does a triangle have?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 0,
      options: [
        { text: '2', isCorrect: false, order: 0 },
        { text: '3', isCorrect: true, order: 1 },
      ],
    });
    await repository.create(question);

    const updated = await useCase.execute({
      id: question.id,
      data: {
        options: [
          { text: 'Three', isCorrect: true },
          { text: 'Four', isCorrect: false },
          { text: 'Five', isCorrect: false },
        ],
      },
    });

    expect(updated.options).toHaveLength(3);
    expect(updated.options[0].text).toBe('Three');
    expect(updated.options[0].isCorrect).toBe(true);
    expect(updated.options[0].order).toBe(0);
    expect(updated.options[2].order).toBe(2);
  });

  it('should be able to activate and deactivate a question', async () => {
    const question = Question.create({
      content: 'Status test?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 0,
    });
    await repository.create(question);

    await useCase.execute({ id: question.id, data: { status: 'INACTIVE' } });
    expect(repository.items[0].status).toBe('INACTIVE');

    await useCase.execute({ id: question.id, data: { status: 'ACTIVE' } });
    expect(repository.items[0].status).toBe('ACTIVE');
  });

  it('should only update provided fields (partial update)', async () => {
    const question = Question.create({
      content: 'Original?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 0,
      explanation: 'Original explanation',
    });
    await repository.create(question);

    const updated = await useCase.execute({
      id: question.id,
      data: { explanation: 'Updated explanation' },
    });

    expect(updated.content).toBe('Original?');
    expect(updated.type).toBe('SINGLE_CHOICE');
    expect(updated.explanation).toBe('Updated explanation');
  });

  it('should be able to update imageUrl and studyLink', async () => {
    const question = Question.create({
      content: 'Question with image?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 0,
    });
    await repository.create(question);

    const updated = await useCase.execute({
      id: question.id,
      data: {
        imageUrl: 'https://example.com/new-image.png',
        studyLink: 'https://docs.example.com/ref',
      },
    });

    expect(updated.imageUrl).toBe('https://example.com/new-image.png');
    expect(updated.studyLink).toBe('https://docs.example.com/ref');
  });

  it('should be able to clear imageUrl by passing null', async () => {
    const question = Question.create({
      content: 'Q?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 0,
      imageUrl: 'https://example.com/image.png',
    });
    await repository.create(question);

    const updated = await useCase.execute({
      id: question.id,
      data: { imageUrl: null },
    });

    expect(updated.imageUrl).toBeNull();
  });

  it('should throw ResourceNotFoundError when question does not exist', async () => {
    await expect(
      useCase.execute({ id: 'non-existing-id', data: { content: 'Test' } }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should persist the updated question state in the repository', async () => {
    const question = Question.create({
      content: 'Before?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      order: 0,
    });
    await repository.create(question);

    await useCase.execute({ id: question.id, data: { content: 'After?' } });

    const inRepo = await repository.findById(question.id);
    expect(inRepo?.content).toBe('After?');
  });
});
