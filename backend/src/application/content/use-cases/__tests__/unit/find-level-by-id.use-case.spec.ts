import { FindLevelByIdUseCase } from '../../find-level-by-id.use-case';
import { InMemoryLevelRepository } from '../../../../../../test/repositories/in-memory-level.repository';
import { Level } from '../../../../../domain/content/entities/level.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { Percentage } from '../../../../../domain/content/value-objects/percentage';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('FindLevelByIdUseCase', () => {
  let useCase: FindLevelByIdUseCase;
  let repository: InMemoryLevelRepository;

  beforeEach(() => {
    repository = new InMemoryLevelRepository();
    useCase = new FindLevelByIdUseCase(repository);
  });

  it('should return a level when it exists', async () => {
    const level = Level.create({
      name: 'My Level',
      slug: Slug.create('my-level'),
      topicId: 'topic-01',
      order: 0,
      xpReward: 150,
      passingPercentage: Percentage.create(70),
    });
    await repository.create(level);

    const found = await useCase.execute(level.id);

    expect(found.id).toBe(level.id);
    expect(found.name).toBe('My Level');
    expect(found.xpReward).toBe(150);
    expect(found.passingPercentage).toBe(70);
  });

  it('should throw ResourceNotFoundError when level does not exist', async () => {
    await expect(useCase.execute('non-existing-id')).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });

  it('should throw ResourceNotFoundError with the correct identifier in the message', async () => {
    await expect(useCase.execute('bad-id')).rejects.toThrow(
      "Level with identifier 'bad-id' not found",
    );
  });
});
