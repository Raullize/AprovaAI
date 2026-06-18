import {
  ExamResult as PrismaExamResult,
  ExamAnswer as PrismaExamAnswer,
} from '@prisma/client';
import {
  ExamResult,
  ExamAnswer,
  SimulationStatus,
  SimulationMode,
} from '../../../../domain/simulations/entities/exam-result.entity';

type PrismaExamResultWithRelations = PrismaExamResult & {
  answers?: PrismaExamAnswer[];
  level?: {
    name: string;
    topic?: {
      name: string;
      exam?: {
        name: string;
        category?: unknown;
        iconKey?: string | null;
        colorScheme?: string | null;
      } | null;
    } | null;
  } | null;
};

export class PrismaExamResultMapper {
  static toDomain(
    raw: PrismaExamResultWithRelations,
  ): ExamResult {
    return ExamResult.create(
      {
        userId: raw.userId,
        levelId: raw.levelId,
        status: raw.status as SimulationStatus,
        mode: raw.mode as SimulationMode,
        score: raw.score,
        totalQuestions: raw.totalQuestions,
        percentage: raw.percentage,
        passed: raw.passed,
        stars: raw.stars,
        timeSpent: raw.timeSpent,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        level: raw.level
          ? {
              name: raw.level.name,
              topic: raw.level.topic
                ? {
                    name: raw.level.topic.name,
                    exam: raw.level.topic.exam
                      ? {
                          name: raw.level.topic.exam.name,
                          category:
                            raw.level.topic.exam.category !== undefined &&
                            raw.level.topic.exam.category !== null
                              ? String(raw.level.topic.exam.category)
                              : undefined,
                          iconKey: raw.level.topic.exam.iconKey ?? undefined,
                          colorScheme:
                            raw.level.topic.exam.colorScheme ?? undefined,
                        }
                      : undefined,
                  }
                : undefined,
            }
          : undefined,
        answers: raw.answers?.map((ans) =>
          ExamAnswer.create(
            {
              examResultId: ans.examResultId,
              questionId: ans.questionId,
              selectedOptions: ans.selectedOptions,
              isCorrect: ans.isCorrect,
              timeSpent: ans.timeSpent,
              isFlaggedForReview: ans.isFlaggedForReview,
              createdAt: ans.createdAt,
              updatedAt: ans.updatedAt,
            },
            ans.id,
          ),
        ),
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
      mode: examResult.mode,
      score: examResult.score ?? null,
      totalQuestions: examResult.totalQuestions,
      percentage: examResult.percentage ?? null,
      passed: examResult.passed ?? null,
      stars: examResult.stars ?? null,
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
      isFlaggedForReview: answer.isFlaggedForReview,
      createdAt: answer.createdAt ?? new Date(),
      updatedAt: answer.updatedAt ?? new Date(),
    };
  }
}
