import { Topic } from '../entities/topic.entity';

export abstract class TopicRepository {
  abstract findAll(): Promise<Topic[]>;
  abstract findByExamId(examId: string): Promise<Topic[]>;
  abstract findById(id: string): Promise<Topic | null>;
  abstract findBySlug(slug: string): Promise<Topic | null>;
  abstract findBySlugAndExamId(
    slug: string,
    examId: string,
  ): Promise<Topic | null>;
  abstract create(topic: Topic): Promise<Topic>;
  abstract update(id: string, data: Partial<Topic>): Promise<Topic>;
  abstract delete(id: string): Promise<void>;
  abstract reorder(orderedIds: string[]): Promise<void>;
  abstract countByExamId(examId: string): Promise<number>;
}
