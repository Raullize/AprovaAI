import { FindSimulationsByTopicIdUseCase } from '../../find-simulations-by-topic-id.use-case';
import { InMemorySimulationRepository } from '../../../../../../test/repositories/in-memory-simulation.repository';
import { Simulation } from '../../../../../domain/content/entities/simulation.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';

describe('FindSimulationsByTopicIdUseCase', () => {
  let useCase: FindSimulationsByTopicIdUseCase;
  let repository: InMemorySimulationRepository;

  beforeEach(() => {
    repository = new InMemorySimulationRepository();
    useCase = new FindSimulationsByTopicIdUseCase(repository);
  });

  it('should return all simulations belonging to a given topic', async () => {
    const simulationA = Simulation.create({
      name: 'Simulation A',
      slug: Slug.create('simulation-a'),
      topicId: 'topic-01',
      order: 0,
    });
    const simulationB = Simulation.create({
      name: 'Simulation B',
      slug: Slug.create('simulation-b'),
      topicId: 'topic-01',
      order: 1,
    });
    const simulationOther = Simulation.create({
      name: 'Simulation Other Topic',
      slug: Slug.create('simulation-other'),
      topicId: 'topic-02',
      order: 0,
    });

    await repository.create(simulationA);
    await repository.create(simulationB);
    await repository.create(simulationOther);

    const result = await useCase.execute('topic-01');

    expect(result).toHaveLength(2);
    expect(result.every((l) => l.topicId === 'topic-01')).toBe(true);
  });

  it('should return simulations sorted by order', async () => {
    const simulationB = Simulation.create({
      name: 'Simulation B',
      slug: Slug.create('simulation-b'),
      topicId: 'topic-01',
      order: 1,
    });
    const simulationA = Simulation.create({
      name: 'Simulation A',
      slug: Slug.create('simulation-a'),
      topicId: 'topic-01',
      order: 0,
    });

    // Insert in "wrong" order
    await repository.create(simulationB);
    await repository.create(simulationA);

    const result = await useCase.execute('topic-01');

    expect(result[0].id).toBe(simulationA.id);
    expect(result[1].id).toBe(simulationB.id);
  });

  it('should return an empty array when no simulations belong to the topic', async () => {
    const result = await useCase.execute('topic-not-found');

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });
});
