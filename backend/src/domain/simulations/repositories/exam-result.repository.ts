import { ExamResult, ExamAnswer } from '../entities/exam-result.entity';

export abstract class ExamResultRepository {
  abstract findById(id: string): Promise<ExamResult | null>;
  abstract findActiveByUserIdAndLevelId(
    userId: string,
    levelId: string,
  ): Promise<ExamResult | null>;
  abstract findHistoryByUserId(userId: string): Promise<ExamResult[]>;
  abstract create(examResult: ExamResult): Promise<ExamResult>;
  abstract save(examResult: ExamResult): Promise<ExamResult>;
  abstract saveAnswer(answer: ExamAnswer): Promise<ExamAnswer>;
}
