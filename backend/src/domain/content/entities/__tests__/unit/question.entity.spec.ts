import { Question } from '../../question.entity';

describe('Question Entity', () => {
  it('should be able to create a question', () => {
    const question = Question.create({
      content: 'Test Question',
      levelId: 'level-1',
      order: 1,
    });

    expect(question).toBeDefined();
    expect(question.id).toBeDefined();
    expect(question.content).toBe('Test Question');
    expect(question.type).toBe('MULTIPLE_CHOICE');
    expect(question.status).toBe('ACTIVE');
    expect(question.options).toEqual([]);
  });

  it('should activate a question', () => {
    const question = Question.create({
      content: 'Test Question',
      levelId: 'level-1',
      order: 1,
      status: 'INACTIVE',
    });

    question.activate();

    expect(question.status).toBe('ACTIVE');
    expect(question.updatedAt).toBeDefined();
  });

  it('should deactivate a question', () => {
    const question = Question.create({
      content: 'Test Question',
      levelId: 'level-1',
      order: 1,
    });

    question.deactivate();

    expect(question.status).toBe('INACTIVE');
  });

  it('should update question details', () => {
    const question = Question.create({
      content: 'Test Question',
      levelId: 'level-1',
      order: 1,
    });

    question.updateDetails({
      content: 'Updated Question',
      imageUrl: 'image.png',
      type: 'SINGLE_CHOICE',
      explanation: 'Explanation',
      studyLink: 'link.com',
      levelId: 'level-2',
    });

    expect(question.content).toBe('Updated Question');
    expect(question.imageUrl).toBe('image.png');
    expect(question.type).toBe('SINGLE_CHOICE');
    expect(question.explanation).toBe('Explanation');
    expect(question.studyLink).toBe('link.com');
    expect(question.levelId).toBe('level-2');
  });

  it('should update question order', () => {
    const question = Question.create({
      content: 'Test Question',
      levelId: 'level-1',
      order: 1,
    });

    question.updateOrder(5);

    expect(question.order).toBe(5);
  });

  it('should update question options', () => {
    const question = Question.create({
      content: 'Test Question',
      levelId: 'level-1',
      order: 1,
    });

    question.updateOptions([
      { text: 'Option A', isCorrect: true, order: 1 },
      { text: 'Option B', isCorrect: false, order: 2 },
    ]);

    expect(question.options).toHaveLength(2);
    expect(question.options[0].text).toBe('Option A');
  });

  it('should throw error when updating options with empty array', () => {
    const question = Question.create({
      content: 'Test Question',
      levelId: 'level-1',
      order: 1,
    });

    expect(() => {
      question.updateOptions([]);
    }).toThrow('A question must have at least one option.');
  });
});
