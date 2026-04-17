import { ReorderTopicsUseCase } from '../../reorder-topics.use-case';
import { InMemoryTopicRepository } from '../../../../../../test/repositories/in-memory-topic.repository';
import { Topic } from '../../../../../domain/content/entities/topic.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';

describe('ReorderTopicsUseCase', () => {
  let useCase: ReorderTopicsUseCase;
  let repository: InMemoryTopicRepository;

  beforeEach(() => {
    repository = new InMemoryTopicRepository();
    useCase = new ReorderTopicsUseCase(repository);
  });

  it('should reorder topics according to the given ids array', async () => {
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
    const topicC = Topic.create({
      name: 'Topic C',
      slug: Slug.create('topic-c'),
      examId: 'exam-01',
      order: 2,
    });

    await repository.create(topicA);
    await repository.create(topicB);
    await repository.create(topicC);

    // Reverse the order: C, A, B
    await useCase.execute({ ids: [topicC.id, topicA.id, topicB.id] });

    const reorderedTopics = await repository.findByExamId('exam-01');

    expect(reorderedTopics[0].id).toBe(topicC.id);
    expect(reorderedTopics[1].id).toBe(topicA.id);
    expect(reorderedTopics[2].id).toBe(topicB.id);
  });

  it('should assign correct numeric order values (0-indexed)', async () => {
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

    await useCase.execute({ ids: [topicB.id, topicA.id] });

    const topicBAfter = repository.items.find((t) => t.id === topicB.id)!;
    const topicAAfter = repository.items.find((t) => t.id === topicA.id)!;

    expect(topicBAfter.order).toBe(0);
    expect(topicAAfter.order).toBe(1);
  });
});
