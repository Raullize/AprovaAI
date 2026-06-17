import { ExamResult as PrismaExamResult, ExamAnswer as PrismaExamAnswer } from '@prisma/client';
import { ExamResult, ExamAnswer, SimulationStatus } from '../../../../domain/simulations/entities/exam-result.entity';

export class PrismaExamResultMapper {
  static toDomain(
    raw: PrismaExamResult & { answers?: PrismaExamAnswer[] },
  ): ExamResult {
    return ExamResult.create(
      {
        userId: raw.userId,
        levelId: raw.levelId,
        status: raw.status as SimulationStatus,
        score: raw.score,
        totalQuestions: raw.totalQuestions,
        percentage: raw.percentage,
        passed: raw.passed,
        timeSpent: raw.timeSpent,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        answers: raw.answers?.map(ans => ExamAnswer.create({
          examResultId: ans.examResultId,
          questionId: ans.questionId,
          selectedOptions: ans.selectedOptions,
          isCorrect: ans.isCorrect,
          timeSpent: ans.timeSpent,
          createdAt: ans.createdAt,
          updatedAt: ans.updatedAt,
        }, ans.id))
      },
      raw.id,
    );
  }

  static toPrisma(examResult: ExamResult): PrismaExamResult {
    return {
      id: examResult.id,
      userId: examResult.userId,
      levelId: examResult.levelId,
      status: examResult.status,
      score: examResult.score ?? null,
      totalQuestions: examResult.totalQuestions,
      percentage: examResult.percentage ?? null,
      passed: examResult.passed ?? null,
      timeSpent: examResult.timeSpent ?? null,
      createdAt: examResult.createdAt ?? new Date(),
      updatedAt: examResult.updatedAt ?? new Date(),
    };
  }

  static answerToPrisma(answer: ExamAnswer): PrismaExamAnswer {
    return {
      id: answer.id,
      examResultId: answer.examResultId,
      questionId: answer.questionId,
      selectedOptions: answer.selectedOptions,
      isCorrect: answer.isCorrect ?? null,
      timeSpent: answer.timeSpent ?? null,
      createdAt: answer.createdAt ?? new Date(),
      updatedAt: answer.updatedAt ?? new Date(),
    };
  }
}
