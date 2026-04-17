import { FindLevelBySlugUseCase } from '../../find-level-by-slug.use-case';
import { InMemoryLevelRepository } from '../../../../../../test/repositories/in-memory-level.repository';
import { Level } from '../../../../../domain/content/entities/level.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('FindLevelBySlugUseCase', () => {
  let useCase: FindLevelBySlugUseCase;
  let repository: InMemoryLevelRepository;

  beforeEach(() => {
    repository = new InMemoryLevelRepository();
    useCase = new FindLevelBySlugUseCase(repository);
  });

  it('should return a level when slug is found', async () => {
    const level = Level.create({
      name: 'My Level',
      slug: Slug.create('my-level'),
      topicId: 'topic-01',
      order: 0,
    });
    await repository.create(level);

    const found = await useCase.execute('my-level');

    expect(found.id).toBe(level.id);
    expect(found.name).toBe('My Level');
    expect(found.slug.value).toBe('my-level');
  });

  it('should throw ResourceNotFoundError when slug does not match any level', async () => {
    await expect(useCase.execute('non-existing-slug')).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });

  it('should return the correct level when multiple exist', async () => {
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

    const found = await useCase.execute('level-b');

    expect(found.id).toBe(levelB.id);
    expect(found.name).toBe('Level B');
  });
});
