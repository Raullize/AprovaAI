import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { QuestionRepository } from '../../../domain/content/repositories/question.repository';
import { Question } from '../../../domain/content/entities/question.entity';

@Injectable()
export class FindAllQuestionsUseCase implements UseCase<void, Question[]> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(): Promise<Question[]> {
    return this.questionRepository.findAll();
  }
}
