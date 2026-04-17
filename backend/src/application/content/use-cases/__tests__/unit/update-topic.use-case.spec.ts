import { UpdateTopicUseCase } from '../../update-topic.use-case';
import { InMemoryTopicRepository } from '../../../../../../test/repositories/in-memory-topic.repository';
import { Topic } from '../../../../../domain/content/entities/topic.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('Update Topic Use Case', () => {
  let inMemoryTopicRepository: InMemoryTopicRepository;
  let sut: UpdateTopicUseCase;

  beforeEach(() => {
    inMemoryTopicRepository = new InMemoryTopicRepository();
    sut = new UpdateTopicUseCase(inMemoryTopicRepository);
  });

  it('should be able to update a topic', async () => {
    const topic = Topic.create({
      name: 'Old Name',
      slug: Slug.createFromText('old-name'),
      examId: 'exam-1',
    });
    inMemoryTopicRepository.items.push(topic);

    const updatedTopic = await sut.execute({
      id: topic.id,
      data: {
        name: 'New Name',
        description: 'New Description',
      },
    });

    expect(updatedTopic.name).toBe('New Name');
    expect(updatedTopic.slug.value).toBe('new-name');
    expect(updatedTopic.description).toBe('New Description');
  });

  it('should not update slug if name is not changed', async () => {
    const topic = Topic.create({
      name: 'Name',
      slug: Slug.createFromText('name'),
      examId: 'exam-1',
    });
    inMemoryTopicRepository.items.push(topic);

    const updatedTopic = await sut.execute({
      id: topic.id,
      data: {
        description: 'Updated Description',
      },
    });

    expect(updatedTopic.slug.value).toBe('name');
    expect(updatedTopic.description).toBe('Updated Description');
  });

  it('should be able to activate and deactivate a topic', async () => {
    const topic = Topic.create({
      name: 'Topic',
      slug: Slug.createFromText('topic'),
      examId: 'exam-1',
    });
    inMemoryTopicRepository.items.push(topic);

    await sut.execute({
      id: topic.id,
      data: { status: 'INACTIVE' },
    });

    expect(inMemoryTopicRepository.items[0].status).toBe('INACTIVE');

    await sut.execute({
      id: topic.id,
      data: { status: 'ACTIVE' },
    });

    expect(inMemoryTopicRepository.items[0].status).toBe('ACTIVE');
  });

  it('should throw ResourceNotFoundError if topic does not exist', async () => {
    await expect(
      sut.execute({
        id: 'non-existing-id',
        data: { name: 'New Name' },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
