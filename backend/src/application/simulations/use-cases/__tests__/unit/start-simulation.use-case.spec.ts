import { StartSimulationUseCase } from '../../start-simulation.use-case';
import { InMemorySimulationAttemptRepository } from '../../../../../../test/repositories/in-memory-simulation-attempt.repository';
import { InMemorySimulationRepository } from '../../../../../../test/repositories/in-memory-simulation.repository';
import { Simulation } from '../../../../../domain/content/entities/simulation.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { Percentage } from '../../../../../domain/content/value-objects/percentage';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';
import { ValidationError } from '../../../../../shared/core/errors/validation.error';
import { SimulationAttempt } from '../../../../../domain/simulations/entities/simulation-attempt.entity';

describe('StartSimulationUseCase', () => {
  let simulationAttemptRepository: InMemorySimulationAttemptRepository;
  let simulationRepository: InMemorySimulationRepository;
  let sut: StartSimulationUseCase;

  beforeEach(() => {
    simulationAttemptRepository = new InMemorySimulationAttemptRepository();
    simulationRepository = new InMemorySimulationRepository();
    sut = new StartSimulationUseCase(
      simulationAttemptRepository,
      simulationRepository,
    );
  });

  it('should create a new simulation using simulation mode and questions count', async () => {
    const simulation = Simulation.create({
      name: 'Nivel 1',
      slug: Slug.create('nivel-1'),
      topicId: 'topic-1',
      order: 0,
      xpReward: 100,
      passingPercentage: Percentage.create(70),
      simulationMode: 'EXAM',
      questionsCount: 10,
    });

    await simulationRepository.create(simulation);

    const result = await sut.execute({
      userId: 'user-1',
      simulationId: simulation.id,
    });

    expect(result.status).toBe('IN_PROGRESS');
    expect(result.mode).toBe('EXAM');
    expect(result.totalQuestions).toBe(10);
    expect(simulationAttemptRepository.items).toHaveLength(1);
  });

  it('should resume an active simulation when one already exists', async () => {
    const simulation = Simulation.create({
      name: 'Nivel 2',
      slug: Slug.create('nivel-2'),
      topicId: 'topic-1',
      order: 1,
      xpReward: 100,
      passingPercentage: Percentage.create(70),
      simulationMode: 'PRACTICE',
      questionsCount: 5,
    });

    const existingSimulation = SimulationAttempt.create({
      userId: 'user-1',
      simulationId: simulation.id,
      status: 'IN_PROGRESS',
      mode: 'PRACTICE',
      totalQuestions: 5,
      answers: [],
    });

    await simulationRepository.create(simulation);
    await simulationAttemptRepository.create(existingSimulation);

    const result = await sut.execute({
      userId: 'user-1',
      simulationId: simulation.id,
    });

    expect(result.id).toBe(existingSimulation.id);
    expect(simulationAttemptRepository.items).toHaveLength(1);
  });

  it('should throw ResourceNotFoundError when simulation does not exist', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
        simulationId: 'missing-simulation',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should throw ValidationError when simulation has no questions', async () => {
    const simulation = Simulation.create({
      name: 'Nivel vazio',
      slug: Slug.create('nivel-vazio'),
      topicId: 'topic-1',
      order: 2,
      xpReward: 0,
      passingPercentage: Percentage.create(70),
      questionsCount: 0,
    });

    await simulationRepository.create(simulation);

    await expect(
      sut.execute({
        userId: 'user-1',
        simulationId: simulation.id,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
