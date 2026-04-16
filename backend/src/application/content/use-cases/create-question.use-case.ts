import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { QuestionRepository } from '../../../domain/content/repositories/question.repository';
import { Question } from '../../../domain/content/entities/question.entity';
import { CreateQuestionDto } from '../../../api/questions/dto/question.dto';

@Injectable()
export class CreateQuestionUseCase implements UseCase<
  CreateQuestionDto,
  Question
> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(request: CreateQuestionDto): Promise<Question> {
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
