import { ExamResult, ExamAnswer } from '../entities/exam-result.entity';

export interface ExamResultRepository {
  findById(id: string): Promise<ExamResult | null>;
  findActiveByUserIdAndLevelId(
    userId: string,
    levelId: string,
  ): Promise<ExamResult | null>;
  findHistoryByUserId(userId: string): Promise<ExamResult[]>;
  create(examResult: ExamResult): Promise<ExamResult>;
  save(examResult: ExamResult): Promise<ExamResult>;
  saveAnswer(answer: ExamAnswer): Promise<ExamAnswer>;
}
