import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import type { ExamResultRepository } from '../../../domain/simulations/repositories/exam-result.repository';
import type { QuestionRepository } from '../../../domain/content/repositories/question.repository';
import { ExamAnswer } from '../../../domain/simulations/entities/exam-result.entity';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';
import { ValidationError } from '../../../shared/core/errors/validation.error';

export interface SaveAnswerRequest {
  userId: string;
  examResultId: string;
  questionId: string;
  selectedOptions: string[];
  timeSpent?: number;
}

@Injectable()
export class SaveAnswerUseCase implements UseCase<SaveAnswerRequest, ExamAnswer> {
  constructor(
    @Inject('ExamResultRepository')
    private readonly examResultRepository: ExamResultRepository,
    @Inject('QuestionRepository')
    private readonly questionRepository: QuestionRepository,
  ) {}

  async execute(request: SaveAnswerRequest): Promise<ExamAnswer> {
    // 1. Fetch simulation
    const examResult = await this.examResultRepository.findById(request.examResultId);
    if (!examResult) {
      throw new ResourceNotFoundError('ExamResult', request.examResultId);
    }

    // 2. Validate simulation belongs to user and is in progress
    if (examResult.userId !== request.userId) {
      throw new ValidationError('You do not have permission to answer this simulation');
    }

    if (examResult.status !== 'IN_PROGRESS') {
      throw new ValidationError('Cannot answer a simulation that is not in progress');
    }

    // 3. Validate question exists
    const question = await this.questionRepository.findById(request.questionId);
    if (!question) {
      throw new ResourceNotFoundError('Question', request.questionId);
    }

    // Validate question belongs to the level being tested
    if (question.levelId !== examResult.levelId) {
      throw new ValidationError('This question does not belong to the current simulation level');
    }

    // 4. Calculate if answer is correct
    // Note: Assuming question entity has options with isCorrect property
    let isCorrect = false;
    
    if (question.type === 'SINGLE_CHOICE') {
      const correctOption = question.options.find(opt => opt.isCorrect);
      isCorrect = correctOption?.id ? request.selectedOptions.includes(correctOption.id) : false;
    } else if (question.type === 'MULTIPLE_CHOICE') {
      const correctOptionsIds = question.options.filter(opt => opt.isCorrect && opt.id).map(opt => opt.id as string);
      
      // Must select exactly all correct options
      isCorrect = 
        correctOptionsIds.length === request.selectedOptions.length &&
        correctOptionsIds.every(id => request.selectedOptions.includes(id));
    }

    // 5. Save answer
    const newAnswer = ExamAnswer.create({
      examResultId: examResult.id,
      questionId: question.id,
      selectedOptions: request.selectedOptions,
      isCorrect,
      timeSpent: request.timeSpent,
    });

    return this.examResultRepository.saveAnswer(newAnswer);
  }
}
