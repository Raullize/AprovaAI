import { FindAllLevelsUseCase } from '../../find-all-levels.use-case';
import { InMemoryLevelRepository } from '../../../../../../test/repositories/in-memory-level.repository';
import { Level } from '../../../../../domain/content/entities/level.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';

describe('FindAllLevelsUseCase', () => {
  let useCase: FindAllLevelsUseCase;
  let repository: InMemoryLevelRepository;

  beforeEach(() => {
    repository = new InMemoryLevelRepository();
    useCase = new FindAllLevelsUseCase(repository);
  });

  it('should return all levels from the repository', async () => {
    const levelA = Level.create({
      name: 'Level A',
      slug: Slug.create('level-a'),
      topicId: 'topic-01',
      order: 0,
    });
    const levelB = Level.create({
      name: 'Level B',
      slug: Slug.create('level-b'),
      topicId: 'topic-02',
      order: 0,
    });

    await repository.create(levelA);
    await repository.create(levelB);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result.map((l) => l.id)).toContain(levelA.id);
    expect(result.map((l) => l.id)).toContain(levelB.id);
  });

  it('should return an empty array when there are no levels', async () => {
    const result = await useCase.execute();

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });
});
