import { Level } from '../../src/domain/content/entities/level.entity';
import { LevelRepository } from '../../src/domain/content/repositories/level.repository';

export class InMemoryLevelRepository implements LevelRepository {
  public items: Level[] = [];

  findAll(): Promise<Level[]> {
    return Promise.resolve(this.items);
  }

  findByTopicId(topicId: string): Promise<Level[]> {
    const levels = this.items.filter((item) => item.topicId === topicId);
    return Promise.resolve(levels.sort((a, b) => a.order - b.order));
  }

  findById(id: string): Promise<Level | null> {
    const level = this.items.find((item) => item.id === id);
    return Promise.resolve(level || null);
  }

  findBySlug(slug: string): Promise<Level | null> {
    const level = this.items.find((item) => item.slug.value === slug);
    return Promise.resolve(level || null);
  }

  findBySlugAndTopicId(slug: string, topicId: string): Promise<Level | null> {
    const level = this.items.find(
      (item) => item.slug.value === slug && item.topicId === topicId,
    );
    return Promise.resolve(level || null);
  }

  create(level: Level): Promise<Level> {
    this.items.push(level);
    return Promise.resolve(level);
  }

  save(level: Level): Promise<Level> {
    const itemIndex = this.items.findIndex((item) => item.id === level.id);

    if (itemIndex >= 0) {
      this.items[itemIndex] = level;
    }

    return Promise.resolve(level);
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
      const level = this.items.find((item) => item.id === id);
      if (level) {
        level.updateOrder(index);
      }
    });
    return Promise.resolve();
  }

  countByTopicId(topicId: string): Promise<number> {
    const count = this.items.filter((item) => item.topicId === topicId).length;
    return Promise.resolve(count);
  }
}
