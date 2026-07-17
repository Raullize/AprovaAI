import { FindSimulationByIdUseCase } from '../../find-simulation-by-id.use-case';
import { InMemorySimulationRepository } from '../../../../../../test/repositories/in-memory-simulation.repository';
import { Simulation } from '../../../../../domain/content/entities/simulation.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { Percentage } from '../../../../../domain/content/value-objects/percentage';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('FindSimulationByIdUseCase', () => {
  let useCase: FindSimulationByIdUseCase;
  let repository: InMemorySimulationRepository;

  beforeEach(() => {
    repository = new InMemorySimulationRepository();
    useCase = new FindSimulationByIdUseCase(repository);
  });

  it('should return a simulation when it exists', async () => {
    const simulation = Simulation.create({
      name: 'My Simulation',
      slug: Slug.create('my-simulation'),
      topicId: 'topic-01',
      order: 0,
      xpReward: 150,
      passingPercentage: Percentage.create(70),
    });
    await repository.create(simulation);

    const found = await useCase.execute(simulation.id);

    expect(found.id).toBe(simulation.id);
    expect(found.name).toBe('My Simulation');
    expect(found.xpReward).toBe(150);
    expect(found.passingPercentage).toBe(70);
  });

  it('should throw ResourceNotFoundError when simulation does not exist', async () => {
    await expect(useCase.execute('non-existing-id')).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });

  it('should throw ResourceNotFoundError with the correct identifier in the message', async () => {
    await expect(useCase.execute('bad-id')).rejects.toThrow(
      "Simulation with identifier 'bad-id' not found",
    );
  });
});
