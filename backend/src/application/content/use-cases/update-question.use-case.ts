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
    const question = await this.questionRepository.findById(request.id);

    if (!question) {
      throw new ResourceNotFoundError('Question', request.id);
    }

    const updateData: Record<string, any> = {};

    if (request.data.content !== undefined)
      updateData['content'] = request.data.content;
    if (request.data.imageUrl !== undefined)
      updateData['imageUrl'] = request.data.imageUrl;
    if (request.data.type !== undefined) updateData['type'] = request.data.type;
    if (request.data.status !== undefined)
      updateData['status'] = request.data.status;
    if (request.data.levelId !== undefined)
      updateData['levelId'] = request.data.levelId;
    if (request.data.explanation !== undefined)
      updateData['explanation'] = request.data.explanation;
    if (request.data.studyLink !== undefined)
      updateData['studyLink'] = request.data.studyLink;

    if (request.data.options !== undefined) {
      updateData['options'] = request.data.options.map((opt, index) => ({
        ...opt,
        order: index,
      }));
    }

    return this.questionRepository.update(request.id, updateData);
  }
}
