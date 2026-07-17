import { FindAllSimulationsUseCase } from '../../find-all-simulations.use-case';
import { InMemorySimulationRepository } from '../../../../../../test/repositories/in-memory-simulation.repository';
import { Simulation } from '../../../../../domain/content/entities/simulation.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';

describe('FindAllSimulationsUseCase', () => {
  let useCase: FindAllSimulationsUseCase;
  let repository: InMemorySimulationRepository;

  beforeEach(() => {
    repository = new InMemorySimulationRepository();
    useCase = new FindAllSimulationsUseCase(repository);
  });

  it('should return all simulations from the repository', async () => {
    const simulationA = Simulation.create({
      name: 'Simulation A',
      slug: Slug.create('simulation-a'),
      topicId: 'topic-01',
      order: 0,
    });
    const simulationB = Simulation.create({
      name: 'Simulation B',
      slug: Slug.create('simulation-b'),
      topicId: 'topic-02',
      order: 0,
    });

    await repository.create(simulationA);
    await repository.create(simulationB);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result.map((l) => l.id)).toContain(simulationA.id);
    expect(result.map((l) => l.id)).toContain(simulationB.id);
  });

  it('should return an empty array when there are no simulations', async () => {
    const result = await useCase.execute();

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });
});
