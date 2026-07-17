import { FindSimulationBySlugUseCase } from '../../find-simulation-by-slug.use-case';
import { InMemorySimulationRepository } from '../../../../../../test/repositories/in-memory-simulation.repository';
import { Simulation } from '../../../../../domain/content/entities/simulation.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('FindSimulationBySlugUseCase', () => {
  let useCase: FindSimulationBySlugUseCase;
  let repository: InMemorySimulationRepository;

  beforeEach(() => {
    repository = new InMemorySimulationRepository();
    useCase = new FindSimulationBySlugUseCase(repository);
  });

  it('should return a simulation when slug is found', async () => {
    const simulation = Simulation.create({
      name: 'My Simulation',
      slug: Slug.create('my-simulation'),
      topicId: 'topic-01',
      order: 0,
    });
    await repository.create(simulation);

    const found = await useCase.execute('my-simulation');

    expect(found.id).toBe(simulation.id);
    expect(found.name).toBe('My Simulation');
    expect(found.slug.value).toBe('my-simulation');
  });

  it('should throw ResourceNotFoundError when slug does not match any simulation', async () => {
    await expect(useCase.execute('non-existing-slug')).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });

  it('should return the correct simulation when multiple exist', async () => {
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

    const found = await useCase.execute('simulation-b');

    expect(found.id).toBe(simulationB.id);
    expect(found.name).toBe('Simulation B');
  });
});
