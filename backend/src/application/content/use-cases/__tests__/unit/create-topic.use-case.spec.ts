import { CreateTopicUseCase } from '../../create-topic.use-case';
import { InMemoryTopicRepository } from '../../../../../../test/repositories/in-memory-topic.repository';

describe('Create Topic Use Case', () => {
  let inMemoryTopicRepository: InMemoryTopicRepository;
  let sut: CreateTopicUseCase;

  beforeEach(() => {
    inMemoryTopicRepository = new InMemoryTopicRepository();
    sut = new CreateTopicUseCase(inMemoryTopicRepository);
  });

  it('should be able to create a topic', async () => {
    const topic = await sut.execute({
      name: 'Topic 1',
      description: 'Topic description',
      examId: 'exam-1',
    });

    expect(topic.id).toBeDefined();
    expect(topic.name).toBe('Topic 1');
    expect(topic.slug.value).toBe('topic-1');
    expect(topic.order).toBe(0);
    expect(inMemoryTopicRepository.items).toHaveLength(1);
    expect(inMemoryTopicRepository.items[0].id).toBe(topic.id);
  });

  it('should create a topic with correct order based on existing topics', async () => {
    await sut.execute({ name: 'Topic 1', examId: 'exam-1' });
    await sut.execute({ name: 'Topic 2', examId: 'exam-1' });

    const topic = await sut.execute({
      name: 'Topic 3',
      examId: 'exam-1',
    });

    expect(topic.order).toBe(2);
    expect(inMemoryTopicRepository.items).toHaveLength(3);
  });

  it('should append a suffix to the slug if a topic with same name exists in same exam', async () => {
    await sut.execute({ name: 'Same Name', examId: 'exam-1' });
    const topic = await sut.execute({ name: 'Same Name', examId: 'exam-1' });

    expect(topic.slug.value).toBe('same-name-1');
  });
});
