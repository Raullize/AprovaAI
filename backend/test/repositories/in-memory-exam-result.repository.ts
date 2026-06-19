import { ExamResultRepository } from '../../src/domain/simulations/repositories/exam-result.repository';
import {
  ExamAnswer,
  ExamResult,
} from '../../src/domain/simulations/entities/exam-result.entity';

export class InMemoryExamResultRepository implements ExamResultRepository {
  public items: ExamResult[] = [];
  public answers: ExamAnswer[] = [];

  async findById(id: string): Promise<ExamResult | null> {
    const examResult = this.items.find((item) => item.id === id);
    return examResult ?? null;
  }

  async findActiveByUserIdAndLevelId(
    userId: string,
    levelId: string,
  ): Promise<ExamResult | null> {
    const examResult = this.items.find(
      (item) =>
        item.userId === userId &&
        item.levelId === levelId &&
        item.status === 'IN_PROGRESS',
    );

    return examResult ?? null;
  }

  async findHistoryByUserId(userId: string): Promise<ExamResult[]> {
    return this.items.filter((item) => item.userId === userId);
  }

  async create(examResult: ExamResult): Promise<ExamResult> {
    this.items.push(examResult);
    return examResult;
  }

  async save(examResult: ExamResult): Promise<ExamResult> {
    const index = this.items.findIndex((item) => item.id === examResult.id);

    if (index >= 0) {
      this.items[index] = examResult;
    } else {
      this.items.push(examResult);
    }

    return examResult;
  }

  async saveAnswer(answer: ExamAnswer): Promise<ExamAnswer> {
    const index = this.answers.findIndex(
      (item) =>
        item.examResultId === answer.examResultId &&
        item.questionId === answer.questionId,
    );

    if (index >= 0) {
      this.answers[index] = answer;
    } else {
      this.answers.push(answer);
    }

    const examResultIndex = this.items.findIndex(
      (item) => item.id === answer.examResultId,
    );

    if (examResultIndex >= 0) {
      const examResult = this.items[examResultIndex];
      const nextAnswers = examResult.answers.filter(
        (item) => item.questionId !== answer.questionId,
      );
      nextAnswers.push(answer);

      this.items[examResultIndex] = ExamResult.create(
        {
          userId: examResult.userId,
          levelId: examResult.levelId,
          status: examResult.status,
          mode: examResult.mode,
          score: examResult.score,
          totalQuestions: examResult.totalQuestions,
          percentage: examResult.percentage,
          passed: examResult.passed,
          stars: examResult.stars,
          timeSpent: examResult.timeSpent,
          answers: nextAnswers,
          level: examResult.level,
          createdAt: examResult.createdAt,
          updatedAt: new Date(),
        },
        examResult.id,
      );
    }

    return answer;
  }
}
