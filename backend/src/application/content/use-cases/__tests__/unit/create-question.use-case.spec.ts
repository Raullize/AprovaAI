import { CreateQuestionUseCase } from '../../create-question.use-case';
import { InMemoryQuestionRepository } from '../../../../../../test/repositories/in-memory-question.repository';

describe('CreateQuestionUseCase', () => {
  let useCase: CreateQuestionUseCase;
  let repository: InMemoryQuestionRepository;

  beforeEach(() => {
    repository = new InMemoryQuestionRepository();
    useCase = new CreateQuestionUseCase(repository);
  });

  it('should be able to create a new question', async () => {
    const question = await useCase.execute({
      content: 'What is 2 + 2?',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      options: [
        { text: '3', isCorrect: false },
        { text: '4', isCorrect: true },
      ],
    });

    expect(question.id).toBeDefined();
    expect(question.content).toBe('What is 2 + 2?');
    expect(question.type).toBe('SINGLE_CHOICE');
    expect(question.levelId).toBe('level-01');
    expect(question.status).toBe('ACTIVE');
    expect(question.order).toBe(0);

    expect(repository.items).toHaveLength(1);
    expect(repository.items[0].id).toBe(question.id);
  });

  it('should map options with correct order (0-indexed)', async () => {
    const question = await useCase.execute({
      content: 'Which is a primary color?',
      type: 'MULTIPLE_CHOICE',
      levelId: 'level-01',
      options: [
        { text: 'Red', isCorrect: true },
        { text: 'Green', isCorrect: false },
        { text: 'Purple', isCorrect: false },
      ],
    });

    expect(question.options).toHaveLength(3);
    expect(question.options[0].order).toBe(0);
    expect(question.options[1].order).toBe(1);
    expect(question.options[2].order).toBe(2);
    expect(question.options[0].text).toBe('Red');
    expect(question.options[0].isCorrect).toBe(true);
  });

  it('should set order based on the count of existing questions in that level', async () => {
    await useCase.execute({
      content: 'Question 1',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
    });
    await useCase.execute({
      content: 'Question 2',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
    });
    const third = await useCase.execute({
      content: 'Question 3',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
    });

    expect(third.order).toBe(2);
    expect(repository.items).toHaveLength(3);
  });

  it('should not share order counter across different levels', async () => {
    await useCase.execute({
      content: 'Q level-01',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
    });
    const firstOfLevel2 = await useCase.execute({
      content: 'Q level-02',
      type: 'SINGLE_CHOICE',
      levelId: 'level-02',
    });

    expect(firstOfLevel2.order).toBe(0);
  });

  it('should create a question with INACTIVE status', async () => {
    const question = await useCase.execute({
      content: 'Inactive question',
      type: 'SINGLE_CHOICE',
      levelId: 'level-01',
      status: 'INACTIVE',
    });

    expect(question.status).toBe('INACTIVE');
  });

  it('should create a question with optional fields', async () => {
    const question = await useCase.execute({
      content: 'Question with extras',
      type: 'MULTIPLE_CHOICE',
      levelId: 'level-01',
      imageUrl: 'https://example.com/image.png',
      explanation: 'This is the reason.',
      studyLink: 'https://docs.example.com',
    });

    expect(question.imageUrl).toBe('https://example.com/image.png');
    expect(question.explanation).toBe('This is the reason.');
    expect(question.studyLink).toBe('https://docs.example.com');
  });

  it('should create a question with empty options if none provided', async () => {
    const question = await useCase.execute({
      content: 'No options question',
      type: 'MULTIPLE_CHOICE',
      levelId: 'level-01',
    });

    expect(question.options).toHaveLength(0);
  });
});
