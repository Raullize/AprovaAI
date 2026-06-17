import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import type { ExamResultRepository } from '../../../domain/simulations/repositories/exam-result.repository';
import { ExamResult } from '../../../domain/simulations/entities/exam-result.entity';
import type { LevelRepository } from '../../../domain/content/repositories/level.repository';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';
import { ValidationError } from '../../../shared/core/errors/validation.error';

export interface StartSimulationRequest {
  userId: string;
  levelId: string;
}

@Injectable()
export class StartSimulationUseCase implements UseCase<
  StartSimulationRequest,
  ExamResult
> {
  constructor(
    @Inject('ExamResultRepository')
    private readonly examResultRepository: ExamResultRepository,
    @Inject('LevelRepository')
    private readonly levelRepository: LevelRepository,
  ) {}

  async execute(request: StartSimulationRequest): Promise<ExamResult> {
    // 1. Check if level exists and count questions
    const level = await this.levelRepository.findById(request.levelId);
    if (!level) {
      throw new ResourceNotFoundError('Level', request.levelId);
    }

    if (level.questionsCount === 0) {
      throw new ValidationError(
        'Cannot start a simulation for a level with no questions',
      );
    }

    // 2. Check if user already has an active simulation for this level
    const activeSimulation =
      await this.examResultRepository.findActiveByUserIdAndLevelId(
        request.userId,
        request.levelId,
      );

    if (activeSimulation) {
      // Resume existing simulation
      return activeSimulation;
    }

    // 3. Create new simulation
    const newSimulation = ExamResult.create({
      userId: request.userId,
      levelId: request.levelId,
      status: 'IN_PROGRESS',
      mode: level.simulationMode,
      totalQuestions: level.questionsCount,
      answers: [],
    });

    return this.examResultRepository.create(newSimulation);
  }
}
