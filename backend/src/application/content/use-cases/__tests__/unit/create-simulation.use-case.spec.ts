import { CreateSimulationUseCase } from '../../create-simulation.use-case';
import { InMemorySimulationRepository } from '../../../../../../test/repositories/in-memory-simulation.repository';

describe('Create Simulation Use Case', () => {
  let inMemorySimulationRepository: InMemorySimulationRepository;
  let sut: CreateSimulationUseCase;

  beforeEach(() => {
    inMemorySimulationRepository = new InMemorySimulationRepository();
    sut = new CreateSimulationUseCase(inMemorySimulationRepository);
  });

  it('should be able to create a simulation', async () => {
    const simulation = await sut.execute({
      name: 'Simulation 1',
      description: 'Simulation description',
      topicId: 'topic-1',
      xpReward: 100,
    });

    expect(simulation.id).toBeDefined();
    expect(simulation.name).toBe('Simulation 1');
    expect(simulation.slug.value).toBe('simulation-1');
    expect(simulation.xpReward).toBe(100);
    expect(simulation.passingPercentage).toBe(70.0);
    expect(simulation.order).toBe(0);
    expect(inMemorySimulationRepository.items).toHaveLength(1);
  });

  it('should create a simulation with correct order based on existing simulations', async () => {
    await sut.execute({ name: 'Simulation 1', topicId: 'topic-1' });
    await sut.execute({ name: 'Simulation 2', topicId: 'topic-1' });

    const simulation = await sut.execute({
      name: 'Simulation 3',
      topicId: 'topic-1',
    });

    expect(simulation.order).toBe(2);
    expect(inMemorySimulationRepository.items).toHaveLength(3);
  });

  it('should append a suffix to the slug if a simulation with same name exists in same topic', async () => {
    await sut.execute({ name: 'Same Name', topicId: 'topic-1' });
    const simulation = await sut.execute({ name: 'Same Name', topicId: 'topic-1' });

    expect(simulation.slug.value).toBe('same-name-1');
  });
});
