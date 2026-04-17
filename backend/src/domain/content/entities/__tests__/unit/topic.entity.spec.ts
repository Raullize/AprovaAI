import { Topic } from '../../topic.entity';
import { Slug } from '../../../value-objects/slug';

describe('Topic Entity', () => {
  it('should be able to create a topic', () => {
    const topic = Topic.create({
      name: 'Test Topic',
      slug: Slug.createFromText('test-topic'),
      examId: 'exam-1',
    });

    expect(topic).toBeDefined();
    expect(topic.id).toBeDefined();
    expect(topic.name).toBe('Test Topic');
    expect(topic.status).toBe('ACTIVE');
    expect(topic.order).toBe(0);
  });

  it('should activate a topic', () => {
    const topic = Topic.create({
      name: 'Test Topic',
      slug: Slug.createFromText('test-topic'),
      examId: 'exam-1',
      status: 'INACTIVE',
    });

    topic.activate();

    expect(topic.status).toBe('ACTIVE');
    expect(topic.updatedAt).toBeDefined();
  });

  it('should deactivate a topic', () => {
    const topic = Topic.create({
      name: 'Test Topic',
      slug: Slug.createFromText('test-topic'),
      examId: 'exam-1',
    });

    topic.deactivate();

    expect(topic.status).toBe('INACTIVE');
  });

  it('should update topic details', () => {
    const topic = Topic.create({
      name: 'Test Topic',
      slug: Slug.createFromText('test-topic'),
      examId: 'exam-1',
    });

    topic.updateDetails(
      'Updated Topic',
      'New Description',
      Slug.createFromText('updated-topic'),
      'exam-2',
    );

    expect(topic.name).toBe('Updated Topic');
    expect(topic.description).toBe('New Description');
    expect(topic.slug.value).toBe('updated-topic');
    expect(topic.examId).toBe('exam-2');
  });

  it('should update topic order', () => {
    const topic = Topic.create({
      name: 'Test Topic',
      slug: Slug.createFromText('test-topic'),
      examId: 'exam-1',
    });

    topic.updateOrder(5);

    expect(topic.order).toBe(5);
  });
});
