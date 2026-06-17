import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import type { ExamResultRepository } from '../../../domain/simulations/repositories/exam-result.repository';
import { ExamResult } from '../../../domain/simulations/entities/exam-result.entity';
import type { LevelRepository } from '../../../domain/content/repositories/level.repository';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';
import { ValidationError } from '../../../shared/core/errors/validation.error';

export interface FinishSimulationRequest {
  userId: string;
  examResultId: string;
  timeSpent?: number;
}

@Injectable()
export class FinishSimulationUseCase implements UseCase<FinishSimulationRequest, ExamResult> {
  constructor(
    @Inject('ExamResultRepository')
    private readonly examResultRepository: ExamResultRepository,
    @Inject('LevelRepository')
    private readonly levelRepository: LevelRepository,
  ) {}

  async execute(request: FinishSimulationRequest): Promise<ExamResult> {
    // 1. Fetch simulation with answers
    const examResult = await this.examResultRepository.findById(request.examResultId);
    if (!examResult) {
      throw new ResourceNotFoundError('ExamResult', request.examResultId);
    }

    if (examResult.userId !== request.userId) {
      throw new ValidationError('You do not have permission to finish this simulation');
    }

    if (examResult.status !== 'IN_PROGRESS') {
      throw new ValidationError('This simulation is already finished or abandoned');
    }

    // 2. Fetch level to know passing criteria
    const level = await this.levelRepository.findById(examResult.levelId);
    if (!level) {
      throw new ResourceNotFoundError('Level', examResult.levelId);
    }

    // 3. Calculate score
    const totalQuestions = examResult.totalQuestions;
    const correctAnswersCount = examResult.answers.filter(ans => ans.isCorrect).length;
    const percentage = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
    
    // 4. Determine pass/fail
    const passed = percentage >= level.passingPercentage;

    // 5. Update and save
    // We recreate the entity to apply the business rules cleanly
    const updatedSimulation = ExamResult.create({
      userId: examResult.userId,
      levelId: examResult.levelId,
      status: 'COMPLETED',
      score: correctAnswersCount,
      totalQuestions: totalQuestions,
      percentage,
      passed,
      timeSpent: request.timeSpent ?? examResult.timeSpent,
      answers: examResult.answers,
      createdAt: examResult.createdAt,
      updatedAt: new Date(),
    }, examResult.id);

    // 6. Give XP to user if passed (This would ideally dispatch a Domain Event to the User module)
    // For now, we will handle this via event or direct repository injection in a refactor
    // Example: if (passed) { user.addXp(level.xpReward); userRepository.save(user); }

    return this.examResultRepository.save(updatedSimulation);
  }
}
