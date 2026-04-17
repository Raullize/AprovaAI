import { ReorderLevelsUseCase } from '../../reorder-levels.use-case';
import { InMemoryLevelRepository } from '../../../../../../test/repositories/in-memory-level.repository';
import { Level } from '../../../../../domain/content/entities/level.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';

describe('ReorderLevelsUseCase', () => {
  let useCase: ReorderLevelsUseCase;
  let repository: InMemoryLevelRepository;

  beforeEach(() => {
    repository = new InMemoryLevelRepository();
    useCase = new ReorderLevelsUseCase(repository);
  });

  it('should reorder levels according to the given ids array', async () => {
    const levelA = Level.create({
      name: 'Level A',
      slug: Slug.create('level-a'),
      topicId: 'topic-01',
      order: 0,
    });
    const levelB = Level.create({
      name: 'Level B',
      slug: Slug.create('level-b'),
      topicId: 'topic-01',
      order: 1,
    });
    const levelC = Level.create({
      name: 'Level C',
      slug: Slug.create('level-c'),
      topicId: 'topic-01',
      order: 2,
    });

    await repository.create(levelA);
    await repository.create(levelB);
    await repository.create(levelC);

    // Reverse the order: C, A, B
    await useCase.execute({ ids: [levelC.id, levelA.id, levelB.id] });

    const reordered = await repository.findByTopicId('topic-01');

    expect(reordered[0].id).toBe(levelC.id);
    expect(reordered[1].id).toBe(levelA.id);
    expect(reordered[2].id).toBe(levelB.id);
  });

  it('should assign correct numeric order values (0-indexed)', async () => {
    const levelA = Level.create({
      name: 'Level A',
      slug: Slug.create('level-a'),
      topicId: 'topic-01',
      order: 0,
    });
    const levelB = Level.create({
      name: 'Level B',
      slug: Slug.create('level-b'),
      topicId: 'topic-01',
      order: 1,
    });

    await repository.create(levelA);
    await repository.create(levelB);

    await useCase.execute({ ids: [levelB.id, levelA.id] });

    const levelBAfter = repository.items.find((l) => l.id === levelB.id)!;
    const levelAAfter = repository.items.find((l) => l.id === levelA.id)!;

    expect(levelBAfter.order).toBe(0);
    expect(levelAAfter.order).toBe(1);
  });
});
