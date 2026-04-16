import {
  Question as PrismaQuestion,
  Option as PrismaOption,
} from '@prisma/client';
import { Question } from '../../../../domain/content/entities/question.entity';

type PrismaQuestionWithOptions = PrismaQuestion & { options: PrismaOption[] };

export class PrismaQuestionMapper {
  static toDomain(raw: PrismaQuestionWithOptions): Question {
    return Question.create(
      {
        content: raw.content,
        imageUrl: raw.imageUrl,
        type: raw.type,
        status: raw.status,
        order: raw.order,
        explanation: raw.explanation,
        studyLink: raw.studyLink,
        levelId: raw.levelId,
        options: raw.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: opt.order,
        })),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }
}
