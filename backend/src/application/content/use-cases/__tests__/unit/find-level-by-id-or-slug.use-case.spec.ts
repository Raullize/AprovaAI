import { FindLevelByIdOrSlugUseCase } from '../../find-level-by-id-or-slug.use-case';
import { InMemoryLevelRepository } from '../../../../../../test/repositories/in-memory-level.repository';
import { Level } from '../../../../../domain/content/entities/level.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { Percentage } from '../../../../../domain/content/value-objects/percentage';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('FindLevelByIdOrSlugUseCase', () => {
  let repository: InMemoryLevelRepository;
  let sut: FindLevelByIdOrSlugUseCase;

  beforeEach(() => {
    repository = new InMemoryLevelRepository();
    sut = new FindLevelByIdOrSlugUseCase(repository);
  });

  it('should return a level when searching by id', async () => {
    const level = Level.create({
      name: 'Level 1',
      slug: Slug.create('level-1'),
      topicId: 'topic-1',
      order: 0,
      xpReward: 100,
      passingPercentage: Percentage.create(70),
    });

    await repository.create(level);

    const result = await sut.execute(level.id);

    expect(result.id).toBe(level.id);
    expect(result.name).toBe('Level 1');
  });

  it('should return a level when searching by slug', async () => {
    const level = Level.create({
      name: 'Level 2',
      slug: Slug.create('level-2'),
      topicId: 'topic-1',
      order: 1,
      xpReward: 150,
      passingPercentage: Percentage.create(80),
    });

    await repository.create(level);

    const result = await sut.execute('level-2');

    expect(result.id).toBe(level.id);
    expect(result.xpReward).toBe(150);
  });

  it('should throw ResourceNotFoundError when level does not exist', async () => {
    await expect(sut.execute('missing-level')).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
