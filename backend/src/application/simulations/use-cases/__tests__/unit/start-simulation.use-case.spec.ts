import { StartSimulationUseCase } from '../../start-simulation.use-case';
import { InMemorySimulationAttemptRepository } from '../../../../../../test/repositories/in-memory-simulation-attempt.repository';
import { InMemorySimulationRepository } from '../../../../../../test/repositories/in-memory-simulation.repository';
import { InMemoryTopicRepository } from '../../../../../../test/repositories/in-memory-topic.repository';
import { InMemoryExamRepository } from '../../../../../../test/repositories/in-memory-exam.repository';
import { Simulation } from '../../../../../domain/content/entities/simulation.entity';
import { Topic } from '../../../../../domain/content/entities/topic.entity';
import { Exam } from '../../../../../domain/content/entities/exam.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { Percentage } from '../../../../../domain/content/value-objects/percentage';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';
import { ValidationError } from '../../../../../shared/core/errors/validation.error';
import { SimulationAttempt } from '../../../../../domain/simulations/entities/simulation-attempt.entity';

describe('StartSimulationUseCase', () => {
  let simulationAttemptRepository: InMemorySimulationAttemptRepository;
  let simulationRepository: InMemorySimulationRepository;
  let topicRepository: InMemoryTopicRepository;
  let examRepository: InMemoryExamRepository;
  let sut: StartSimulationUseCase;

  beforeEach(() => {
    simulationAttemptRepository = new InMemorySimulationAttemptRepository();
    simulationRepository = new InMemorySimulationRepository();
    topicRepository = new InMemoryTopicRepository();
    examRepository = new InMemoryExamRepository();
    sut = new StartSimulationUseCase(
      simulationAttemptRepository,
      simulationRepository,
      topicRepository,
      examRepository,
    );
  });

  async function seedTrail(
    options: { allowUnordered?: boolean; numberOfSimulations?: number } = {},
  ) {
    const { allowUnordered = true, numberOfSimulations = 1 } = options;

    const exam = Exam.create({
      name: 'Exam',
      slug: Slug.create('exam'),
      allowUnordered,
    });
    await examRepository.create(exam);

    const topic = Topic.create({
      name: 'Topic',
      slug: Slug.create('topic'),
      examId: exam.id,
      order: 0,
    });
    await topicRepository.create(topic);

    const simulations = Array.from({ length: numberOfSimulations }, (_, i) =>
      Simulation.create({
        name: `Nivel ${i + 1}`,
        slug: Slug.create(`nivel-${i + 1}`),
        topicId: topic.id,
        order: i,
        xpReward: 100,
        passingPercentage: Percentage.create(70),
        simulationMode: 'EXAM',
        questionsCount: 10,
      }),
    );

    for (const simulation of simulations) {
      await simulationRepository.create(simulation);
    }

    return { exam, topic, simulations };
  }

  it('should create a new simulation using simulation mode and questions count', async () => {
    const { simulations } = await seedTrail();

    const result = await sut.execute({
      userId: 'user-1',
      simulationId: simulations[0].id,
    });

    expect(result.status).toBe('IN_PROGRESS');
    expect(result.mode).toBe('EXAM');
    expect(result.totalQuestions).toBe(10);
    expect(simulationAttemptRepository.items).toHaveLength(1);
  });

  it('should resume an active simulation when one already exists', async () => {
    const { simulations } = await seedTrail();

    const existingSimulation = SimulationAttempt.create({
      userId: 'user-1',
      simulationId: simulations[0].id,
      status: 'IN_PROGRESS',
      mode: 'EXAM',
      totalQuestions: 10,
      answers: [],
    });

    await simulationAttemptRepository.create(existingSimulation);

    const result = await sut.execute({
      userId: 'user-1',
      simulationId: simulations[0].id,
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
    const { topic } = await seedTrail();

    const simulation = Simulation.create({
      name: 'Nivel vazio',
      slug: Slug.create('nivel-vazio'),
      topicId: topic.id,
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

  it('should allow starting any simulation when exam allows unordered access', async () => {
    const { simulations } = await seedTrail({
      allowUnordered: true,
      numberOfSimulations: 2,
    });

    const result = await sut.execute({
      userId: 'user-1',
      simulationId: simulations[1].id,
    });

    expect(result.status).toBe('IN_PROGRESS');
    expect(result.simulationId).toBe(simulations[1].id);
  });

  it('should throw ResourceNotFoundError when exam requires order and previous simulations were not passed', async () => {
    const { simulations } = await seedTrail({
      allowUnordered: false,
      numberOfSimulations: 2,
    });

    await expect(
      sut.execute({
        userId: 'user-1',
        simulationId: simulations[1].id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should allow starting a later simulation when previous simulations were passed', async () => {
    const { simulations } = await seedTrail({
      allowUnordered: false,
      numberOfSimulations: 2,
    });

    const passedAttempt = SimulationAttempt.create({
      userId: 'user-1',
      simulationId: simulations[0].id,
      status: 'COMPLETED',
      passed: true,
      mode: 'EXAM',
      totalQuestions: 10,
      answers: [],
    });
    await simulationAttemptRepository.create(passedAttempt);

    const result = await sut.execute({
      userId: 'user-1',
      simulationId: simulations[1].id,
    });

    expect(result.status).toBe('IN_PROGRESS');
    expect(result.simulationId).toBe(simulations[1].id);
  });
});
