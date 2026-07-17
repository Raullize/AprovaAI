import { Question } from '../entities/question.entity';

export abstract class QuestionRepository {
  abstract findAll(): Promise<Question[]>;
  abstract findBySimulationId(simulationId: string): Promise<Question[]>;
  abstract findById(id: string): Promise<Question | null>;
  abstract create(question: Question): Promise<Question>;
  abstract save(question: Question): Promise<Question>;
  abstract delete(id: string): Promise<void>;
  abstract reorder(orderedIds: string[]): Promise<void>;
  abstract countBySimulationId(simulationId: string): Promise<number>;
}
