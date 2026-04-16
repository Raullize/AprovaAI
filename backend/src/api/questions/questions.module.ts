import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import {
  FindAllQuestionsUseCase,
  FindQuestionsByLevelIdUseCase,
  FindQuestionByIdUseCase,
} from '../../application/content/use-cases/find-questions.use-case';
import { CreateQuestionUseCase } from '../../application/content/use-cases/create-question.use-case';
import { UpdateQuestionUseCase } from '../../application/content/use-cases/update-question.use-case';
import {
  DeleteQuestionUseCase,
  ReorderQuestionsUseCase,
} from '../../application/content/use-cases/reorder-delete-questions.use-case';
import { QuestionRepository } from '../../domain/content/repositories/question.repository';
import { PrismaQuestionRepository } from '../../infrastructure/database/prisma/repositories/prisma-question.repository';

@Module({
  controllers: [QuestionsController],
  providers: [
    FindAllQuestionsUseCase,
    FindQuestionsByLevelIdUseCase,
    FindQuestionByIdUseCase,
    CreateQuestionUseCase,
    UpdateQuestionUseCase,
    DeleteQuestionUseCase,
    ReorderQuestionsUseCase,
    {
      provide: QuestionRepository,
      useClass: PrismaQuestionRepository,
    },
  ],
})
export class QuestionsModule {}
