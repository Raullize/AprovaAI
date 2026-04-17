import { FindTopicByIdUseCase } from '../../find-topic-by-id.use-case';
import { InMemoryTopicRepository } from '../../../../../../test/repositories/in-memory-topic.repository';
import { Topic } from '../../../../../domain/content/entities/topic.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('FindTopicByIdUseCase', () => {
  let useCase: FindTopicByIdUseCase;
  let repository: InMemoryTopicRepository;

  beforeEach(() => {
    repository = new InMemoryTopicRepository();
    useCase = new FindTopicByIdUseCase(repository);
  });

  it('should return a topic when it exists', async () => {
    const topic = Topic.create({
      name: 'My Topic',
      slug: Slug.create('my-topic'),
      examId: 'exam-01',
      order: 0,
    });
    await repository.create(topic);

    const found = await useCase.execute(topic.id);

    expect(found.id).toBe(topic.id);
    expect(found.name).toBe('My Topic');
    expect(found.slug.value).toBe('my-topic');
  });

  it('should throw ResourceNotFoundError when topic does not exist', async () => {
    await expect(useCase.execute('non-existing-id')).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });

  it('should throw ResourceNotFoundError with the correct identifier in the message', async () => {
    await expect(useCase.execute('bad-id')).rejects.toThrow(
      "Topic with identifier 'bad-id' not found",
    );
  });
});
