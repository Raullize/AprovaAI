import { FindTopicsByExamIdUseCase } from '../../find-topics-by-exam-id.use-case';
import { InMemoryTopicRepository } from '../../../../../../test/repositories/in-memory-topic.repository';
import { Topic } from '../../../../../domain/content/entities/topic.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';

describe('FindTopicsByExamIdUseCase', () => {
  let useCase: FindTopicsByExamIdUseCase;
  let repository: InMemoryTopicRepository;

  beforeEach(() => {
    repository = new InMemoryTopicRepository();
    useCase = new FindTopicsByExamIdUseCase(repository);
  });

  it('should return all topics belonging to a given exam', async () => {
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
    const topicOther = Topic.create({
      name: 'Topic Other Exam',
      slug: Slug.create('topic-other'),
      examId: 'exam-02',
      order: 0,
    });

    await repository.create(topicA);
    await repository.create(topicB);
    await repository.create(topicOther);

    const result = await useCase.execute('exam-01');

    expect(result).toHaveLength(2);
    expect(result.every((t) => t.examId === 'exam-01')).toBe(true);
  });

  it('should return topics sorted by order', async () => {
    const topicB = Topic.create({
      name: 'Topic B',
      slug: Slug.create('topic-b'),
      examId: 'exam-01',
      order: 1,
    });
    const topicA = Topic.create({
      name: 'Topic A',
      slug: Slug.create('topic-a'),
      examId: 'exam-01',
      order: 0,
    });

    // Insert in "wrong" order
    await repository.create(topicB);
    await repository.create(topicA);

    const result = await useCase.execute('exam-01');

    expect(result[0].id).toBe(topicA.id);
    expect(result[1].id).toBe(topicB.id);
  });

  it('should return an empty array when no topics belong to the exam', async () => {
    const result = await useCase.execute('exam-not-found');

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });
});
