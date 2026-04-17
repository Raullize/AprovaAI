import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { QuestionRepository } from '../../../domain/content/repositories/question.repository';
import { Question } from '../../../domain/content/entities/question.entity';

export interface CreateQuestionRequest {
  content: string;
  imageUrl?: string | null;
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
  status?: 'ACTIVE' | 'INACTIVE';
  levelId: string;
  explanation?: string | null;
  studyLink?: string | null;
  options?: Array<{
    text: string;
    isCorrect: boolean;
  }>;
}

@Injectable()
export class CreateQuestionUseCase implements UseCase<
  CreateQuestionRequest,
  Question
> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(request: CreateQuestionRequest): Promise<Question> {
    const count = await this.questionRepository.countByLevelId(request.levelId);

    const options =
      request.options?.map((opt, index) => ({
        ...opt,
        order: index,
      })) ?? [];

    const question = Question.create({
      content: request.content,
      imageUrl: request.imageUrl,
      type: request.type,
      status: request.status,
      levelId: request.levelId,
      explanation: request.explanation,
      studyLink: request.studyLink,
      options,
      order: count,
    });

    return this.questionRepository.create(question);
  }
}
