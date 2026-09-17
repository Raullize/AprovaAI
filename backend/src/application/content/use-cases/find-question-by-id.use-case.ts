import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { QuestionRepository } from '../../../domain/content/repositories/question.repository';
import { Question } from '../../../domain/content/entities/question.entity';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';
import { ContentReadOptions } from './content-read-options';

@Injectable()
export class FindQuestionByIdUseCase implements UseCase<
  { id: string; options?: ContentReadOptions },
  Question
> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute({
    id,
    options = {},
  }: {
    id: string;
    options?: ContentReadOptions;
  }): Promise<Question> {
    const { includeDraft = false } = options;
    const question = await this.questionRepository.findById(id);

    if (!question || (!includeDraft && question.status !== 'PUBLISHED')) {
      throw new ResourceNotFoundError('Question', id);
    }

    return question;
  }
}
