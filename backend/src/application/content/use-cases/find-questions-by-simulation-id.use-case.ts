import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { QuestionRepository } from '../../../domain/content/repositories/question.repository';
import { Question } from '../../../domain/content/entities/question.entity';
import { ContentReadOptions } from './content-read-options';

@Injectable()
export class FindQuestionsBySimulationIdUseCase implements UseCase<
  { simulationId: string; options?: ContentReadOptions },
  Question[]
> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute({
    simulationId,
    options = {},
  }: {
    simulationId: string;
    options?: ContentReadOptions;
  }): Promise<Question[]> {
    const { includeDraft = false } = options;
    const questions =
      await this.questionRepository.findBySimulationId(simulationId);
    return includeDraft
      ? questions
      : questions.filter((q) => q.status === 'PUBLISHED');
  }
}
