import { FindQuestionsBySimulationIdUseCase } from '../../find-questions-by-simulation-id.use-case';
import { InMemoryQuestionRepository } from '../../../../../../test/repositories/in-memory-question.repository';
import { Question } from '../../../../../domain/content/entities/question.entity';

describe('FindQuestionsBySimulationIdUseCase', () => {
  let useCase: FindQuestionsBySimulationIdUseCase;
  let repository: InMemoryQuestionRepository;

  beforeEach(() => {
    repository = new InMemoryQuestionRepository();
    useCase = new FindQuestionsBySimulationIdUseCase(repository);
  });

  it('should return all questions belonging to a given simulation', async () => {
    const qA = Question.create({
      content: 'Question A?',
      type: 'SINGLE_CHOICE',
      simulationId: 'simulation-01',
      order: 0,
    });
    const qB = Question.create({
      content: 'Question B?',
      type: 'MULTIPLE_CHOICE',
      simulationId: 'simulation-01',
      order: 1,
    });
    const qOther = Question.create({
      content: 'Question Other Simulation?',
      type: 'SINGLE_CHOICE',
      simulationId: 'simulation-02',
      order: 0,
    });

    await repository.create(qA);
    await repository.create(qB);
    await repository.create(qOther);

    const result = await useCase.execute('simulation-01');

    expect(result).toHaveLength(2);
    expect(result.every((q) => q.simulationId === 'simulation-01')).toBe(true);
  });

  it('should return questions sorted by order', async () => {
    const qB = Question.create({
      content: 'Question B?',
      type: 'SINGLE_CHOICE',
      simulationId: 'simulation-01',
      order: 1,
    });
    const qA = Question.create({
      content: 'Question A?',
      type: 'SINGLE_CHOICE',
      simulationId: 'simulation-01',
      order: 0,
    });

    // Insert in "wrong" order
    await repository.create(qB);
    await repository.create(qA);

    const result = await useCase.execute('simulation-01');

    expect(result[0].id).toBe(qA.id);
    expect(result[1].id).toBe(qB.id);
  });

  it('should return an empty array when no questions belong to the simulation', async () => {
    const result = await useCase.execute('simulation-not-found');

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });
});
