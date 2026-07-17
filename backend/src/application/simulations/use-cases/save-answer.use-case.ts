import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { SimulationAttemptRepository } from '../../../domain/simulations/repositories/simulation-attempt.repository';
import { QuestionRepository } from '../../../domain/content/repositories/question.repository';
import { AttemptAnswer } from '../../../domain/simulations/entities/simulation-attempt.entity';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';
import { ValidationError } from '../../../shared/core/errors/validation.error';

export interface SaveAnswerRequest {
  userId: string;
  simulationAttemptId: string;
  questionId: string;
  selectedOptions: string[];
  timeSpent?: number;
  isFlaggedForReview?: boolean;
}

@Injectable()
export class SaveAnswerUseCase implements UseCase<
  SaveAnswerRequest,
  AttemptAnswer
> {
  constructor(
    private readonly simulationAttemptRepository: SimulationAttemptRepository,
    private readonly questionRepository: QuestionRepository,
  ) {}

  async execute(request: SaveAnswerRequest): Promise<AttemptAnswer> {
    // 1. Fetch simulation
    const simulationAttempt = await this.simulationAttemptRepository.findById(
      request.simulationAttemptId,
    );
    if (!simulationAttempt) {
      throw new ResourceNotFoundError('SimulationAttempt', request.simulationAttemptId);
    }

    // 2. Validate simulation belongs to user and is in progress
    if (simulationAttempt.userId !== request.userId) {
      throw new ValidationError(
        'You do not have permission to answer this simulation',
      );
    }

    if (simulationAttempt.status !== 'IN_PROGRESS') {
      throw new ValidationError(
        'Cannot answer a simulation that is not in progress',
      );
    }

    // 3. Validate question exists
    const question = await this.questionRepository.findById(request.questionId);
    if (!question) {
      throw new ResourceNotFoundError('Question', request.questionId);
    }

    // Validate question belongs to the simulation being tested
    if (question.simulationId !== simulationAttempt.simulationId) {
      throw new ValidationError(
        'This question does not belong to the current simulation simulation',
      );
    }

    // 4. Calculate if answer is correct
    // Note: Assuming question entity has options with isCorrect property
    let isCorrect = false;

    if (question.type === 'SINGLE_CHOICE') {
      const correctOption = question.options.find((opt) => opt.isCorrect);
      isCorrect = correctOption?.id
        ? request.selectedOptions.includes(correctOption.id)
        : false;
    } else if (question.type === 'MULTIPLE_CHOICE') {
      const correctOptionsIds = question.options
        .filter((opt) => opt.isCorrect && opt.id)
        .map((opt) => opt.id as string);

      // Must select exactly all correct options
      isCorrect =
        correctOptionsIds.length === request.selectedOptions.length &&
        correctOptionsIds.every((id) => request.selectedOptions.includes(id));
    }

    // 5. Save answer
    const newAnswer = AttemptAnswer.create({
      simulationAttemptId: simulationAttempt.id,
      questionId: question.id,
      selectedOptions: request.selectedOptions,
      isCorrect,
      timeSpent: request.timeSpent,
      isFlaggedForReview: request.isFlaggedForReview ?? false,
    });

    const savedAnswer = await this.simulationAttemptRepository.saveAnswer(newAnswer);

    // 6. Anti-Cheat: If mode is EXAM, don't return the correctness of the answer
    if (simulationAttempt.mode === 'EXAM') {
      return AttemptAnswer.create(
        {
          simulationAttemptId: savedAnswer.simulationAttemptId,
          questionId: savedAnswer.questionId,
          selectedOptions: savedAnswer.selectedOptions,
          timeSpent: savedAnswer.timeSpent,
          isFlaggedForReview: savedAnswer.isFlaggedForReview,
          createdAt: savedAnswer.createdAt,
          updatedAt: savedAnswer.updatedAt,
          isCorrect: null, // Hide the correct answer from the frontend until simulation finishes
        },
        savedAnswer.id,
      );
    }

    return savedAnswer;
  }
}
