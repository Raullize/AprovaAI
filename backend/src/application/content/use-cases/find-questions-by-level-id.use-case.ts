import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { QuestionRepository } from '../../../domain/content/repositories/question.repository';
import { Question } from '../../../domain/content/entities/question.entity';

@Injectable()
export class FindQuestionsByLevelIdUseCase implements UseCase<string, Question[]> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(levelId: string): Promise<Question[]> {
    return this.questionRepository.findByLevelId(levelId);
  }
}
