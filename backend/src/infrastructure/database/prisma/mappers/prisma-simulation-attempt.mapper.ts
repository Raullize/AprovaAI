import {
  SimulationAttempt as PrismaSimulationAttempt,
  AttemptAnswer as PrismaAttemptAnswer,
} from '@prisma/client';
import {
  SimulationAttempt,
  AttemptAnswer,
  AttemptStatus,
  SimulationMode,
} from '../../../../domain/simulations/entities/simulation-attempt.entity';

type PrismaSimulationAttemptWithRelations = PrismaSimulationAttempt & {
  answers?: PrismaAttemptAnswer[];
  simulation?: {
    name: string;
    xpReward?: number;
    topic?: {
      name: string;
      exam?: {
        id?: string;
        slug?: string;
        name: string;
        category?: unknown;
        iconKey?: string | null;
        colorScheme?: string | null;
      } | null;
    } | null;
  } | null;
};

export class PrismaSimulationAttemptMapper {
  static toDomain(
    raw: PrismaSimulationAttemptWithRelations,
  ): SimulationAttempt {
    return SimulationAttempt.create(
      {
        userId: raw.userId,
        simulationId: raw.simulationId,
        status: raw.status as AttemptStatus,
        mode: raw.mode as SimulationMode,
        score: raw.score,
        totalQuestions: raw.totalQuestions,
        percentage: raw.percentage,
        passed: raw.passed,
        stars: raw.stars,
        timeSpent: raw.timeSpent,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        simulation: raw.simulation
          ? {
              name: raw.simulation.name,
              xpReward: raw.simulation.xpReward,
              topic: raw.simulation.topic
                ? {
                    name: raw.simulation.topic.name,
                    exam: raw.simulation.topic.exam
                      ? {
                          id: raw.simulation.topic.exam.id,
                          slug: raw.simulation.topic.exam.slug,
                          name: raw.simulation.topic.exam.name,
                          category:
                            raw.simulation.topic.exam.category != null
                              ? (raw.simulation.topic.exam.category as string)
                              : undefined,
                          iconKey:
                            raw.simulation.topic.exam.iconKey ?? undefined,
                          colorScheme:
                            raw.simulation.topic.exam.colorScheme ?? undefined,
                        }
                      : undefined,
                  }
                : undefined,
            }
          : undefined,
        answers: raw.answers?.map((ans) =>
          AttemptAnswer.create(
            {
              simulationAttemptId: ans.simulationAttemptId,
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

  static toPrisma(
    simulationAttempt: SimulationAttempt,
  ): PrismaSimulationAttempt {
    return {
      id: simulationAttempt.id,
      userId: simulationAttempt.userId,
      simulationId: simulationAttempt.simulationId,
      status: simulationAttempt.status,
      mode: simulationAttempt.mode,
      score: simulationAttempt.score ?? null,
      totalQuestions: simulationAttempt.totalQuestions,
      percentage: simulationAttempt.percentage ?? null,
      passed: simulationAttempt.passed ?? null,
      stars: simulationAttempt.stars ?? null,
      timeSpent: simulationAttempt.timeSpent ?? null,
      createdAt: simulationAttempt.createdAt ?? new Date(),
      updatedAt: simulationAttempt.updatedAt ?? new Date(),
    };
  }

  static answerToPrisma(answer: AttemptAnswer): PrismaAttemptAnswer {
    return {
      id: answer.id,
      simulationAttemptId: answer.simulationAttemptId,
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
