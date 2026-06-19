import { FindTopicByIdOrSlugUseCase } from '../../find-topic-by-id-or-slug.use-case';
import { InMemoryTopicRepository } from '../../../../../../test/repositories/in-memory-topic.repository';
import { Topic } from '../../../../../domain/content/entities/topic.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('FindTopicByIdOrSlugUseCase', () => {
  let repository: InMemoryTopicRepository;
  let sut: FindTopicByIdOrSlugUseCase;

  beforeEach(() => {
    repository = new InMemoryTopicRepository();
    sut = new FindTopicByIdOrSlugUseCase(repository);
  });

  it('should return a topic when searching by id', async () => {
    const topic = Topic.create({
      name: 'Introducao',
      slug: Slug.create('introducao'),
      examId: 'exam-1',
      order: 0,
    });

    await repository.create(topic);

    const result = await sut.execute(topic.id);

    expect(result.id).toBe(topic.id);
    expect(result.name).toBe('Introducao');
  });

  it('should return a topic when searching by slug', async () => {
    const topic = Topic.create({
      name: 'Seguranca',
      slug: Slug.create('seguranca'),
      examId: 'exam-1',
      order: 1,
    });

    await repository.create(topic);

    const result = await sut.execute('seguranca');

    expect(result.id).toBe(topic.id);
    expect(result.slug.value).toBe('seguranca');
  });

  it('should throw ResourceNotFoundError when topic does not exist', async () => {
    await expect(sut.execute('missing-topic')).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
