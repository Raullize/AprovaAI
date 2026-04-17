import { DeleteLevelUseCase } from '../../delete-level.use-case';
import { InMemoryLevelRepository } from '../../../../../../test/repositories/in-memory-level.repository';
import { Level } from '../../../../../domain/content/entities/level.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';

describe('DeleteLevelUseCase', () => {
  let useCase: DeleteLevelUseCase;
  let repository: InMemoryLevelRepository;

  beforeEach(() => {
    repository = new InMemoryLevelRepository();
    useCase = new DeleteLevelUseCase(repository);
  });

  it('should be able to delete a level', async () => {
    const level = Level.create({
      name: 'Level to Delete',
      slug: Slug.create('level-to-delete'),
      topicId: 'topic-01',
      order: 0,
    });
    await repository.create(level);

    expect(repository.items).toHaveLength(1);

    await useCase.execute(level.id);

    expect(repository.items).toHaveLength(0);
  });

  it('should not throw when deleting a non-existing level', async () => {
    await expect(useCase.execute('non-existing-id')).resolves.not.toThrow();
  });

  it('should only delete the target level, leaving others intact', async () => {
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

    await useCase.execute(levelA.id);

    expect(repository.items).toHaveLength(1);
    expect(repository.items[0].id).toBe(levelB.id);
  });
});
