import { Question } from '../entities/question.entity';

export abstract class QuestionRepository {
  abstract findAll(): Promise<Question[]>;
  abstract findByLevelId(levelId: string): Promise<Question[]>;
  abstract findById(id: string): Promise<Question | null>;
  abstract create(question: Question): Promise<Question>;
  abstract update(id: string, data: Partial<Question>): Promise<Question>;
  abstract delete(id: string): Promise<void>;
  abstract reorder(orderedIds: string[]): Promise<void>;
  abstract countByLevelId(levelId: string): Promise<number>;
}
