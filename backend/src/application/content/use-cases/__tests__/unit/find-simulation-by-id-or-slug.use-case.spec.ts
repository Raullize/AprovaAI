import { FindSimulationByIdOrSlugUseCase } from '../../find-simulation-by-id-or-slug.use-case';
import { InMemorySimulationRepository } from '../../../../../../test/repositories/in-memory-simulation.repository';
import { Simulation } from '../../../../../domain/content/entities/simulation.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { Percentage } from '../../../../../domain/content/value-objects/percentage';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('FindSimulationByIdOrSlugUseCase', () => {
  let repository: InMemorySimulationRepository;
  let sut: FindSimulationByIdOrSlugUseCase;

  beforeEach(() => {
    repository = new InMemorySimulationRepository();
    sut = new FindSimulationByIdOrSlugUseCase(repository);
  });

  it('should return a simulation when searching by id', async () => {
    const simulation = Simulation.create({
      name: 'Simulation 1',
      slug: Slug.create('simulation-1'),
      topicId: 'topic-1',
      order: 0,
      xpReward: 100,
      passingPercentage: Percentage.create(70),
    });

    await repository.create(simulation);

    const result = await sut.execute(simulation.id);

    expect(result.id).toBe(simulation.id);
    expect(result.name).toBe('Simulation 1');
  });

  it('should return a simulation when searching by slug', async () => {
    const simulation = Simulation.create({
      name: 'Simulation 2',
      slug: Slug.create('simulation-2'),
      topicId: 'topic-1',
      order: 1,
      xpReward: 150,
      passingPercentage: Percentage.create(80),
    });

    await repository.create(simulation);

    const result = await sut.execute('simulation-2');

    expect(result.id).toBe(simulation.id);
    expect(result.xpReward).toBe(150);
  });

  it('should throw ResourceNotFoundError when simulation does not exist', async () => {
    await expect(sut.execute('missing-simulation')).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
