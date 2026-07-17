import { DeleteSimulationUseCase } from '../../delete-simulation.use-case';
import { InMemorySimulationRepository } from '../../../../../../test/repositories/in-memory-simulation.repository';
import { Simulation } from '../../../../../domain/content/entities/simulation.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';

describe('DeleteSimulationUseCase', () => {
  let useCase: DeleteSimulationUseCase;
  let repository: InMemorySimulationRepository;

  beforeEach(() => {
    repository = new InMemorySimulationRepository();
    useCase = new DeleteSimulationUseCase(repository);
  });

  it('should be able to delete a simulation', async () => {
    const simulation = Simulation.create({
      name: 'Simulation to Delete',
      slug: Slug.create('simulation-to-delete'),
      topicId: 'topic-01',
      order: 0,
    });
    await repository.create(simulation);

    expect(repository.items).toHaveLength(1);

    await useCase.execute(simulation.id);

    expect(repository.items).toHaveLength(0);
  });

  it('should not throw when deleting a non-existing simulation', async () => {
    await expect(useCase.execute('non-existing-id')).resolves.not.toThrow();
  });

  it('should only delete the target simulation, leaving others intact', async () => {
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
    await repository.create(simulationA);
    await repository.create(simulationB);

    await useCase.execute(simulationA.id);

    expect(repository.items).toHaveLength(1);
    expect(repository.items[0].id).toBe(simulationB.id);
  });
});
