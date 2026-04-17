import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { QuestionRepository } from '../../../domain/content/repositories/question.repository';
import { Question } from '../../../domain/content/entities/question.entity';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';

export interface UpdateQuestionRequest {
  id: string;
  data: {
    content?: string;
    imageUrl?: string | null;
    type?: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
    status?: 'ACTIVE' | 'INACTIVE';
    levelId?: string;
    explanation?: string | null;
    studyLink?: string | null;
    options?: Array<{
      id?: string;
      text: string;
      isCorrect: boolean;
    }>;
  };
}

@Injectable()
export class UpdateQuestionUseCase implements UseCase<
  UpdateQuestionRequest,
  Question
> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(request: UpdateQuestionRequest): Promise<Question> {
    const question: Question | null = await this.questionRepository.findById(
      request.id,
    );

    if (!question) {
      throw new ResourceNotFoundError('Question', request.id);
    }

    if (
      request.data.content !== undefined ||
      request.data.imageUrl !== undefined ||
      request.data.type !== undefined ||
      request.data.explanation !== undefined ||
      request.data.studyLink !== undefined ||
      request.data.levelId !== undefined
    ) {
      question.updateDetails(
        request.data.content ?? question.content,
        request.data.imageUrl !== undefined
          ? request.data.imageUrl
          : question.imageUrl,
        request.data.type ?? question.type,
        request.data.explanation !== undefined
          ? request.data.explanation
          : question.explanation,
        request.data.studyLink !== undefined
          ? request.data.studyLink
          : question.studyLink,
        request.data.levelId ?? question.levelId,
      );
    }

    if (request.data.options !== undefined) {
      question.updateOptions(
        request.data.options.map((opt, index) => ({
          ...opt,
          order: index,
        })),
      );
    }

    if (request.data.status !== undefined) {
      if (request.data.status === 'ACTIVE') {
        question.activate();
      } else {
        question.deactivate();
      }
    }

    return this.questionRepository.save(question);
  }
}
