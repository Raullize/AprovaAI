import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { QuestionRepository } from '../../../domain/content/repositories/question.repository';
import { Question } from '../../../domain/content/entities/question.entity';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';

@Injectable()
export class FindQuestionByIdUseCase implements UseCase<string, Question> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(id: string): Promise<Question> {
    const question = await this.questionRepository.findById(id);
    if (!question) {
      throw new ResourceNotFoundError('Question', id);
    }
    return question;
  }
}
