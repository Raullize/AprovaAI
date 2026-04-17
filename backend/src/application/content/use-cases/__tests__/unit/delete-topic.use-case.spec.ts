import { DeleteTopicUseCase } from '../../delete-topic.use-case';
import { InMemoryTopicRepository } from '../../../../../../test/repositories/in-memory-topic.repository';
import { Topic } from '../../../../../domain/content/entities/topic.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';

describe('DeleteTopicUseCase', () => {
  let useCase: DeleteTopicUseCase;
  let repository: InMemoryTopicRepository;

  beforeEach(() => {
    repository = new InMemoryTopicRepository();
    useCase = new DeleteTopicUseCase(repository);
  });

  it('should be able to delete a topic', async () => {
    const topic = Topic.create({
      name: 'Topic to Delete',
      slug: Slug.create('topic-to-delete'),
      examId: 'exam-01',
      order: 0,
    });
    await repository.create(topic);

    expect(repository.items).toHaveLength(1);

    await useCase.execute(topic.id);

    expect(repository.items).toHaveLength(0);
  });

  it('should not throw when deleting a non-existing topic', async () => {
    await expect(useCase.execute('non-existing-id')).resolves.not.toThrow();
  });

  it('should only delete the target topic, leaving others intact', async () => {
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

    await useCase.execute(topicA.id);

    expect(repository.items).toHaveLength(1);
    expect(repository.items[0].id).toBe(topicB.id);
  });
});
