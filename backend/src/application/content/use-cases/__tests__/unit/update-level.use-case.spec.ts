import { UpdateLevelUseCase } from '../../update-level.use-case';
import { InMemoryLevelRepository } from '../../../../../../test/repositories/in-memory-level.repository';
import { Level } from '../../../../../domain/content/entities/level.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('Update Level Use Case', () => {
  let inMemoryLevelRepository: InMemoryLevelRepository;
  let sut: UpdateLevelUseCase;

  beforeEach(() => {
    inMemoryLevelRepository = new InMemoryLevelRepository();
    sut = new UpdateLevelUseCase(inMemoryLevelRepository);
  });

  it('should be able to update a level', async () => {
    const level = Level.create({
      name: 'Old Name',
      slug: Slug.createFromText('old-name'),
      topicId: 'topic-1',
      order: 1,
    });
    inMemoryLevelRepository.items.push(level);

    const updatedLevel = await sut.execute({
      id: level.id,
      data: {
        name: 'New Name',
        xpReward: 200,
        passingPercentage: 80,
      },
    });

    expect(updatedLevel.name).toBe('New Name');
    expect(updatedLevel.slug.value).toBe('new-name');
    expect(updatedLevel.xpReward).toBe(200);
    expect(updatedLevel.passingPercentage).toBe(80);
  });

  it('should be able to activate and deactivate a level', async () => {
    const level = Level.create({
      name: 'Level',
      slug: Slug.createFromText('level'),
      topicId: 'topic-1',
      order: 1,
    });
    inMemoryLevelRepository.items.push(level);

    await sut.execute({
      id: level.id,
      data: { status: 'INACTIVE' },
    });

    expect(inMemoryLevelRepository.items[0].status).toBe('INACTIVE');

    await sut.execute({
      id: level.id,
      data: { status: 'ACTIVE' },
    });

    expect(inMemoryLevelRepository.items[0].status).toBe('ACTIVE');
  });

  it('should throw ResourceNotFoundError if level does not exist', async () => {
    await expect(
      sut.execute({
        id: 'non-existing-id',
        data: { name: 'New Name' },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
