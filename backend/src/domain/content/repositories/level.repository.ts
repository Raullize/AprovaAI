import { Level } from '../entities/level.entity';

export abstract class LevelRepository {
  abstract findAll(): Promise<Level[]>;
  abstract findByTopicId(topicId: string): Promise<Level[]>;
  abstract findById(id: string): Promise<Level | null>;
  abstract findBySlug(slug: string): Promise<Level | null>;
  abstract findBySlugAndTopicId(
    slug: string,
    topicId: string,
  ): Promise<Level | null>;
  abstract create(level: Level): Promise<Level>;
  abstract update(id: string, data: Partial<Level>): Promise<Level>;
  abstract delete(id: string): Promise<void>;
  abstract reorder(orderedIds: string[]): Promise<void>;
  abstract countByTopicId(topicId: string): Promise<number>;
}
