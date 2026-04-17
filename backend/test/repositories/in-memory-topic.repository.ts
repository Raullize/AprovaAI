import { Topic } from '../../src/domain/content/entities/topic.entity';
import { TopicRepository } from '../../src/domain/content/repositories/topic.repository';
import { DomainEvents } from '../../src/shared/core/events/domain-events';

export class InMemoryTopicRepository implements TopicRepository {
  public items: Topic[] = [];

  findAll(): Promise<Topic[]> {
    return Promise.resolve(this.items);
  }

  findByExamId(examId: string): Promise<Topic[]> {
    const topics = this.items.filter((item) => item.examId === examId);
    return Promise.resolve(topics.sort((a, b) => a.order - b.order));
  }

  findById(id: string): Promise<Topic | null> {
    const topic = this.items.find((item) => item.id === id);
    return Promise.resolve(topic || null);
  }

  findBySlug(slug: string): Promise<Topic | null> {
    const topic = this.items.find((item) => item.slug.value === slug);
    return Promise.resolve(topic || null);
  }

  findBySlugAndExamId(slug: string, examId: string): Promise<Topic | null> {
    const topic = this.items.find(
      (item) => item.slug.value === slug && item.examId === examId,
    );
    return Promise.resolve(topic || null);
  }

  create(topic: Topic): Promise<Topic> {
    this.items.push(topic);
    DomainEvents.dispatchEventsForAggregate(topic.id);
    return Promise.resolve(topic);
  }

  save(topic: Topic): Promise<Topic> {
    const itemIndex = this.items.findIndex((item) => item.id === topic.id);

    if (itemIndex >= 0) {
      this.items[itemIndex] = topic;
      DomainEvents.dispatchEventsForAggregate(topic.id);
    }

    return Promise.resolve(topic);
  }

  delete(id: string): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id === id);

    if (itemIndex >= 0) {
      this.items.splice(itemIndex, 1);
    }

    return Promise.resolve();
  }

  reorder(orderedIds: string[]): Promise<void> {
    orderedIds.forEach((id, index) => {
      const topic = this.items.find((item) => item.id === id);
      if (topic) {
        topic.updateOrder(index);
      }
    });
    return Promise.resolve();
  }

  countByExamId(examId: string): Promise<number> {
    const count = this.items.filter((item) => item.examId === examId).length;
    return Promise.resolve(count);
  }
}
