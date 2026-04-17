import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { QuestionRepository } from '../../../domain/content/repositories/question.repository';

@Injectable()
export class DeleteQuestionUseCase implements UseCase<string, void> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(id: string): Promise<void> {
    await this.questionRepository.delete(id);
  }
}
