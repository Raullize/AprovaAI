import { FindAllTopicsUseCase } from '../../find-all-topics.use-case';
import { InMemoryTopicRepository } from '../../../../../../test/repositories/in-memory-topic.repository';
import { Topic } from '../../../../../domain/content/entities/topic.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';

describe('FindAllTopicsUseCase', () => {
  let useCase: FindAllTopicsUseCase;
  let repository: InMemoryTopicRepository;

  beforeEach(() => {
    repository = new InMemoryTopicRepository();
    useCase = new FindAllTopicsUseCase(repository);
  });

  it('should return all topics from the repository', async () => {
    const topicA = Topic.create({
      name: 'Topic A',
      slug: Slug.create('topic-a'),
      examId: 'exam-01',
      order: 0,
    });
    const topicB = Topic.create({
      name: 'Topic B',
      slug: Slug.create('topic-b'),
      examId: 'exam-02',
      order: 0,
    });

    await repository.create(topicA);
    await repository.create(topicB);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id)).toContain(topicA.id);
    expect(result.map((t) => t.id)).toContain(topicB.id);
  });

  it('should return an empty array when there are no topics', async () => {
    const result = await useCase.execute();

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });
});
