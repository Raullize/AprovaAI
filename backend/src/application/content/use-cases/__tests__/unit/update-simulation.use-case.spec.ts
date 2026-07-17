import { UpdateSimulationUseCase } from '../../update-simulation.use-case';
import { InMemorySimulationRepository } from '../../../../../../test/repositories/in-memory-simulation.repository';
import { Simulation } from '../../../../../domain/content/entities/simulation.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('Update Simulation Use Case', () => {
  let inMemorySimulationRepository: InMemorySimulationRepository;
  let sut: UpdateSimulationUseCase;

  beforeEach(() => {
    inMemorySimulationRepository = new InMemorySimulationRepository();
    sut = new UpdateSimulationUseCase(inMemorySimulationRepository);
  });

  it('should be able to update a simulation', async () => {
    const simulation = Simulation.create({
      name: 'Old Name',
      slug: Slug.createFromText('old-name'),
      topicId: 'topic-1',
      order: 1,
    });
    inMemorySimulationRepository.items.push(simulation);

    const updatedSimulation = await sut.execute({
      id: simulation.id,
      data: {
        name: 'New Name',
        xpReward: 200,
        passingPercentage: 80,
      },
    });

    expect(updatedSimulation.name).toBe('New Name');
    expect(updatedSimulation.slug.value).toBe('new-name');
    expect(updatedSimulation.xpReward).toBe(200);
    expect(updatedSimulation.passingPercentage).toBe(80);
  });

  it('should be able to activate and deactivate a simulation', async () => {
    const simulation = Simulation.create({
      name: 'Simulation',
      slug: Slug.createFromText('simulation'),
      topicId: 'topic-1',
      order: 1,
    });
    inMemorySimulationRepository.items.push(simulation);

    await sut.execute({
      id: simulation.id,
      data: { status: 'DRAFT' },
    });

    expect(inMemorySimulationRepository.items[0].status).toBe('DRAFT');

    await sut.execute({
      id: simulation.id,
      data: { status: 'PUBLISHED' },
    });

    expect(inMemorySimulationRepository.items[0].status).toBe('PUBLISHED');
  });

  it('should throw ResourceNotFoundError if simulation does not exist', async () => {
    await expect(
      sut.execute({
        id: 'non-existing-id',
        data: { name: 'New Name' },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
