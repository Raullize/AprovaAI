import { Exam } from '../entities/exam.entity';

export abstract class ExamRepository {
  abstract findAll(): Promise<Exam[]>;
  abstract findById(id: string): Promise<Exam | null>;
  abstract findBySlug(slug: string): Promise<Exam | null>;
  abstract create(exam: Exam): Promise<Exam>;
  abstract update(id: string, data: Partial<Exam>): Promise<Exam>;
  abstract delete(id: string): Promise<void>;
  abstract reorder(orderedIds: string[]): Promise<void>;
  abstract count(): Promise<number>;
}
