import { ReorderSimulationsUseCase } from '../../reorder-simulations.use-case';
import { InMemorySimulationRepository } from '../../../../../../test/repositories/in-memory-simulation.repository';
import { Simulation } from '../../../../../domain/content/entities/simulation.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';

describe('ReorderSimulationsUseCase', () => {
  let useCase: ReorderSimulationsUseCase;
  let repository: InMemorySimulationRepository;

  beforeEach(() => {
    repository = new InMemorySimulationRepository();
    useCase = new ReorderSimulationsUseCase(repository);
  });

  it('should reorder simulations according to the given ids array', async () => {
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
    const simulationC = Simulation.create({
      name: 'Simulation C',
      slug: Slug.create('simulation-c'),
      topicId: 'topic-01',
      order: 2,
    });

    await repository.create(simulationA);
    await repository.create(simulationB);
    await repository.create(simulationC);

    // Reverse the order: C, A, B
    await useCase.execute({
      ids: [simulationC.id, simulationA.id, simulationB.id],
    });

    const reordered = await repository.findByTopicId('topic-01');

    expect(reordered[0].id).toBe(simulationC.id);
    expect(reordered[1].id).toBe(simulationA.id);
    expect(reordered[2].id).toBe(simulationB.id);
  });

  it('should assign correct numeric order values (0-indexed)', async () => {
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

    await useCase.execute({ ids: [simulationB.id, simulationA.id] });

    const simulationBAfter = repository.items.find(
      (l) => l.id === simulationB.id,
    )!;
    const simulationAAfter = repository.items.find(
      (l) => l.id === simulationA.id,
    )!;

    expect(simulationBAfter.order).toBe(0);
    expect(simulationAAfter.order).toBe(1);
  });
});
