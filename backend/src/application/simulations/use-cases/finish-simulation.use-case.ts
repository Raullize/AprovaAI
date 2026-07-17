import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { SimulationAttemptRepository } from '../../../domain/simulations/repositories/simulation-attempt.repository';
import { SimulationAttempt } from '../../../domain/simulations/entities/simulation-attempt.entity';
import { SimulationRepository } from '../../../domain/content/repositories/simulation.repository';
import { UserRepository } from '../../../domain/users/repositories/user.repository';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';
import { ValidationError } from '../../../shared/core/errors/validation.error';

export interface FinishSimulationRequest {
  userId: string;
  simulationAttemptId: string;
  timeSpent?: number;
}

export interface FinishSimulationResponse {
  simulationAttempt: SimulationAttempt;
  xpGained: number;
}

@Injectable()
export class FinishSimulationUseCase implements UseCase<
  FinishSimulationRequest,
  FinishSimulationResponse
> {
  constructor(
    private readonly simulationAttemptRepository: SimulationAttemptRepository,
    private readonly simulationRepository: SimulationRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(request: FinishSimulationRequest): Promise<FinishSimulationResponse> {
    // 1. Fetch simulation with answers
    const simulationAttempt = await this.simulationAttemptRepository.findById(
      request.simulationAttemptId,
    );
    if (!simulationAttempt) {
      throw new ResourceNotFoundError('SimulationAttempt', request.simulationAttemptId);
    }

    if (simulationAttempt.userId !== request.userId) {
      throw new ValidationError(
        'You do not have permission to finish this simulation',
      );
    }

    if (simulationAttempt.status !== 'IN_PROGRESS') {
      throw new ValidationError(
        'This simulation is already finished or abandoned',
      );
    }

    // 2. Fetch simulation to know passing criteria
    const simulation = await this.simulationRepository.findById(simulationAttempt.simulationId);
    if (!simulation) {
      throw new ResourceNotFoundError('Simulation', simulationAttempt.simulationId);
    }

    // 3. Calculate score
    const totalQuestions = simulationAttempt.totalQuestions;
    const correctAnswersCount = simulationAttempt.answers.filter(
      (ans) => ans.isCorrect,
    ).length;
    const percentage =
      totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;

    // 4. Determine pass/fail
    const passed = percentage >= simulation.passingPercentage;

    // 5. Calculate stars dynamically based on simulation.passingPercentage
    let stars = 0;
    const P = simulation.passingPercentage;
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

    const userAttempts = await this.simulationAttemptRepository.findHistoryByUserId(request.userId);
    const completedAttemptsForSimulation = userAttempts.filter(
      (attempt) =>
        attempt.simulationId === simulationAttempt.simulationId &&
        attempt.status === 'COMPLETED' &&
        attempt.id !== simulationAttempt.id,
    );
    const maxPrevStars = completedAttemptsForSimulation.reduce((max, attempt) => {
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
    const xpGained = Math.round(multiplierDiff * simulation.xpReward);

    if (xpGained > 0) {
      user.grantXp(xpGained);
    }

    // Update user streak & active activities
    const today = new Date();
    user.updateStreak(today);
    await this.userRepository.logActivity(user.id, today);
    await this.userRepository.save(user);

    // 7. Update and save
    const updatedSimulation = SimulationAttempt.create(
      {
        userId: simulationAttempt.userId,
        simulationId: simulationAttempt.simulationId,
        status: 'COMPLETED',
        score: correctAnswersCount,
        totalQuestions: totalQuestions,
        percentage,
        passed,
        stars,
        timeSpent: request.timeSpent ?? simulationAttempt.timeSpent,
        answers: simulationAttempt.answers,
        createdAt: simulationAttempt.createdAt,
        updatedAt: new Date(),
      },
      simulationAttempt.id,
    );

    const savedResult = await this.simulationAttemptRepository.save(updatedSimulation);

    return {
      simulationAttempt: savedResult,
      xpGained,
    };
  }
}
