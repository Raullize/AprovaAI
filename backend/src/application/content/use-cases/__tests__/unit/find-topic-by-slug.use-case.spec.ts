import { FindTopicBySlugUseCase } from '../../find-topic-by-slug.use-case';
import { InMemoryTopicRepository } from '../../../../../../test/repositories/in-memory-topic.repository';
import { Topic } from '../../../../../domain/content/entities/topic.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('FindTopicBySlugUseCase', () => {
  let useCase: FindTopicBySlugUseCase;
  let repository: InMemoryTopicRepository;

  beforeEach(() => {
    repository = new InMemoryTopicRepository();
    useCase = new FindTopicBySlugUseCase(repository);
  });

  it('should return a topic when slug is found', async () => {
    const topic = Topic.create({
      name: 'My Topic',
      slug: Slug.create('my-topic'),
      examId: 'exam-01',
      order: 0,
    });
    await repository.create(topic);

    const found = await useCase.execute('my-topic');

    expect(found.id).toBe(topic.id);
    expect(found.name).toBe('My Topic');
    expect(found.slug.value).toBe('my-topic');
  });

  it('should throw ResourceNotFoundError when slug does not match any topic', async () => {
    await expect(useCase.execute('non-existing-slug')).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });

  it('should return the correct topic when multiple exist', async () => {
    const topicA = Topic.create({
      name: 'Topic A',
      slug: Slug.create('topic-a'),
      examId: 'exam-01',
      order: 0,
    });
    const topicB = Topic.create({
      name: 'Topic B',
      slug: Slug.create('topic-b'),
      examId: 'exam-01',
      order: 1,
    });
    await repository.create(topicA);
    await repository.create(topicB);

    const found = await useCase.execute('topic-b');

    expect(found.id).toBe(topicB.id);
    expect(found.name).toBe('Topic B');
  });
});
