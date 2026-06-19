import { StartSimulationUseCase } from '../../start-simulation.use-case';
import { InMemoryExamResultRepository } from '../../../../../../test/repositories/in-memory-exam-result.repository';
import { InMemoryLevelRepository } from '../../../../../../test/repositories/in-memory-level.repository';
import { Level } from '../../../../../domain/content/entities/level.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { Percentage } from '../../../../../domain/content/value-objects/percentage';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';
import { ValidationError } from '../../../../../shared/core/errors/validation.error';
import { ExamResult } from '../../../../../domain/simulations/entities/exam-result.entity';

describe('StartSimulationUseCase', () => {
  let examResultRepository: InMemoryExamResultRepository;
  let levelRepository: InMemoryLevelRepository;
  let sut: StartSimulationUseCase;

  beforeEach(() => {
    examResultRepository = new InMemoryExamResultRepository();
    levelRepository = new InMemoryLevelRepository();
    sut = new StartSimulationUseCase(examResultRepository, levelRepository);
  });

  it('should create a new simulation using level mode and questions count', async () => {
    const level = Level.create({
      name: 'Nivel 1',
      slug: Slug.create('nivel-1'),
      topicId: 'topic-1',
      order: 0,
      xpReward: 100,
      passingPercentage: Percentage.create(70),
      simulationMode: 'EXAM',
      questionsCount: 10,
    });

    await levelRepository.create(level);

    const result = await sut.execute({
      userId: 'user-1',
      levelId: level.id,
    });

    expect(result.status).toBe('IN_PROGRESS');
    expect(result.mode).toBe('EXAM');
    expect(result.totalQuestions).toBe(10);
    expect(examResultRepository.items).toHaveLength(1);
  });

  it('should resume an active simulation when one already exists', async () => {
    const level = Level.create({
      name: 'Nivel 2',
      slug: Slug.create('nivel-2'),
      topicId: 'topic-1',
      order: 1,
      xpReward: 100,
      passingPercentage: Percentage.create(70),
      simulationMode: 'PRACTICE',
      questionsCount: 5,
    });

    const existingSimulation = ExamResult.create({
      userId: 'user-1',
      levelId: level.id,
      status: 'IN_PROGRESS',
      mode: 'PRACTICE',
      totalQuestions: 5,
      answers: [],
    });

    await levelRepository.create(level);
    await examResultRepository.create(existingSimulation);

    const result = await sut.execute({
      userId: 'user-1',
      levelId: level.id,
    });

    expect(result.id).toBe(existingSimulation.id);
    expect(examResultRepository.items).toHaveLength(1);
  });

  it('should throw ResourceNotFoundError when level does not exist', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
        levelId: 'missing-level',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should throw ValidationError when level has no questions', async () => {
    const level = Level.create({
      name: 'Nivel vazio',
      slug: Slug.create('nivel-vazio'),
      topicId: 'topic-1',
      order: 2,
      xpReward: 0,
      passingPercentage: Percentage.create(70),
      questionsCount: 0,
    });

    await levelRepository.create(level);

    await expect(
      sut.execute({
        userId: 'user-1',
        levelId: level.id,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
