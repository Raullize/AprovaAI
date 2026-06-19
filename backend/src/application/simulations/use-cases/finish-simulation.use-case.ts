import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { ExamResultRepository } from '../../../domain/simulations/repositories/exam-result.repository';
import { ExamResult } from '../../../domain/simulations/entities/exam-result.entity';
import { LevelRepository } from '../../../domain/content/repositories/level.repository';
import { UserRepository } from '../../../domain/users/repositories/user.repository';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';
import { ValidationError } from '../../../shared/core/errors/validation.error';

export interface FinishSimulationRequest {
  userId: string;
  examResultId: string;
  timeSpent?: number;
}

export interface FinishSimulationResponse {
  examResult: ExamResult;
  xpGained: number;
}

@Injectable()
export class FinishSimulationUseCase implements UseCase<
  FinishSimulationRequest,
  FinishSimulationResponse
> {
  constructor(
    private readonly examResultRepository: ExamResultRepository,
    private readonly levelRepository: LevelRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(request: FinishSimulationRequest): Promise<FinishSimulationResponse> {
    // 1. Fetch simulation with answers
    const examResult = await this.examResultRepository.findById(
      request.examResultId,
    );
    if (!examResult) {
      throw new ResourceNotFoundError('ExamResult', request.examResultId);
    }

    if (examResult.userId !== request.userId) {
      throw new ValidationError(
        'You do not have permission to finish this simulation',
      );
    }

    if (examResult.status !== 'IN_PROGRESS') {
      throw new ValidationError(
        'This simulation is already finished or abandoned',
      );
    }

    // 2. Fetch level to know passing criteria
    const level = await this.levelRepository.findById(examResult.levelId);
    if (!level) {
      throw new ResourceNotFoundError('Level', examResult.levelId);
    }

    // 3. Calculate score
    const totalQuestions = examResult.totalQuestions;
    const correctAnswersCount = examResult.answers.filter(
      (ans) => ans.isCorrect,
    ).length;
    const percentage =
      totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;

    // 4. Determine pass/fail
    const passed = percentage >= level.passingPercentage;

    // 5. Calculate stars dynamically based on level.passingPercentage
    let stars = 0;
    const P = level.passingPercentage;
    if (percentage >= Math.max(90, P)) {
      stars = 3;
    } else if (passed) {
      stars = 2;
    } else if (percentage >= Math.max(0, P - 20) && correctAnswersCount > 0) {
      stars = 1;
    }

    // 6. Fetch user and calculate delta XP
    const user = await this.userRepository.findById(request.userId);
    if (!user) {
      throw new ResourceNotFoundError('User', request.userId);
    }

    const userAttempts = await this.examResultRepository.findHistoryByUserId(request.userId);
    const completedAttemptsForLevel = userAttempts.filter(
      (attempt) =>
        attempt.levelId === examResult.levelId &&
        attempt.status === 'COMPLETED' &&
        attempt.id !== examResult.id,
    );
    const maxPrevStars = completedAttemptsForLevel.reduce((max, attempt) => {
      const attemptStars = attempt.stars ?? 0;
      return attemptStars > max ? attemptStars : max;
    }, 0);

    const getMultiplier = (s: number) => {
      if (s === 3) return 1.0;
      if (s === 2) return 0.5;
      if (s === 1) return 0.2;
      return 0.0;
    };

    const prevMultiplier = getMultiplier(maxPrevStars);
    const newMultiplier = getMultiplier(stars);
    const multiplierDiff = Math.max(0, newMultiplier - prevMultiplier);
    const xpGained = Math.round(multiplierDiff * level.xpReward);

    if (xpGained > 0) {
      user.grantXp(xpGained);
    }

    // Update user streak & active activities
    const today = new Date();
    user.updateStreak(today);
    await this.userRepository.logActivity(user.id, today);
    await this.userRepository.save(user);

    // 7. Update and save
    const updatedSimulation = ExamResult.create(
      {
        userId: examResult.userId,
        levelId: examResult.levelId,
        status: 'COMPLETED',
        score: correctAnswersCount,
        totalQuestions: totalQuestions,
        percentage,
        passed,
        stars,
        timeSpent: request.timeSpent ?? examResult.timeSpent,
        answers: examResult.answers,
        createdAt: examResult.createdAt,
        updatedAt: new Date(),
      },
      examResult.id,
    );

    const savedResult = await this.examResultRepository.save(updatedSimulation);

    return {
      examResult: savedResult,
      xpGained,
    };
  }
}
