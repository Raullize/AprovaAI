import { FindLevelsByTopicIdUseCase } from '../../find-levels-by-topic-id.use-case';
import { InMemoryLevelRepository } from '../../../../../../test/repositories/in-memory-level.repository';
import { Level } from '../../../../../domain/content/entities/level.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';

describe('FindLevelsByTopicIdUseCase', () => {
  let useCase: FindLevelsByTopicIdUseCase;
  let repository: InMemoryLevelRepository;

  beforeEach(() => {
    repository = new InMemoryLevelRepository();
    useCase = new FindLevelsByTopicIdUseCase(repository);
  });

  it('should return all levels belonging to a given topic', async () => {
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
    const levelOther = Level.create({
      name: 'Level Other Topic',
      slug: Slug.create('level-other'),
      topicId: 'topic-02',
      order: 0,
    });

    await repository.create(levelA);
    await repository.create(levelB);
    await repository.create(levelOther);

    const result = await useCase.execute('topic-01');

    expect(result).toHaveLength(2);
    expect(result.every((l) => l.topicId === 'topic-01')).toBe(true);
  });

  it('should return levels sorted by order', async () => {
    const levelB = Level.create({
      name: 'Level B',
      slug: Slug.create('level-b'),
      topicId: 'topic-01',
      order: 1,
    });
    const levelA = Level.create({
      name: 'Level A',
      slug: Slug.create('level-a'),
      topicId: 'topic-01',
      order: 0,
    });

    // Insert in "wrong" order
    await repository.create(levelB);
    await repository.create(levelA);

    const result = await useCase.execute('topic-01');

    expect(result[0].id).toBe(levelA.id);
    expect(result[1].id).toBe(levelB.id);
  });

  it('should return an empty array when no levels belong to the topic', async () => {
    const result = await useCase.execute('topic-not-found');

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });
});
