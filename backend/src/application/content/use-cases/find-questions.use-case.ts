import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class FindQuestionsByLevelIdUseCase implements UseCase<
  string,
  Question[]
> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(levelId: string): Promise<Question[]> {
    return this.questionRepository.findByLevelId(levelId);
  }
}

@Injectable()
export class FindQuestionByIdUseCase implements UseCase<string, Question> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(id: string): Promise<Question> {
    const question = await this.questionRepository.findById(id);
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }
}
