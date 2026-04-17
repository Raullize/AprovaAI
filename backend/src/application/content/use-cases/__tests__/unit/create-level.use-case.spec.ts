import { CreateLevelUseCase } from '../../create-level.use-case';
import { InMemoryLevelRepository } from '../../../../../../test/repositories/in-memory-level.repository';

describe('Create Level Use Case', () => {
  let inMemoryLevelRepository: InMemoryLevelRepository;
  let sut: CreateLevelUseCase;

  beforeEach(() => {
    inMemoryLevelRepository = new InMemoryLevelRepository();
    sut = new CreateLevelUseCase(inMemoryLevelRepository);
  });

  it('should be able to create a level', async () => {
    const level = await sut.execute({
      name: 'Level 1',
      description: 'Level description',
      topicId: 'topic-1',
      xpReward: 100,
    });

    expect(level.id).toBeDefined();
    expect(level.name).toBe('Level 1');
    expect(level.slug.value).toBe('level-1');
    expect(level.xpReward).toBe(100);
    expect(level.passingPercentage).toBe(70.0);
    expect(level.order).toBe(0);
    expect(inMemoryLevelRepository.items).toHaveLength(1);
  });

  it('should create a level with correct order based on existing levels', async () => {
    await sut.execute({ name: 'Level 1', topicId: 'topic-1' });
    await sut.execute({ name: 'Level 2', topicId: 'topic-1' });

    const level = await sut.execute({
      name: 'Level 3',
      topicId: 'topic-1',
    });

    expect(level.order).toBe(2);
    expect(inMemoryLevelRepository.items).toHaveLength(3);
  });

  it('should append a suffix to the slug if a level with same name exists in same topic', async () => {
    await sut.execute({ name: 'Same Name', topicId: 'topic-1' });
    const level = await sut.execute({ name: 'Same Name', topicId: 'topic-1' });

    expect(level.slug.value).toBe('same-name-1');
  });
});
