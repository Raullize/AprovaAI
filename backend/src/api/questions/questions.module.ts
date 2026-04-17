import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { FindAllQuestionsUseCase } from '../../application/content/use-cases/find-all-questions.use-case';
import { FindQuestionsByLevelIdUseCase } from '../../application/content/use-cases/find-questions-by-level-id.use-case';
import { FindQuestionByIdUseCase } from '../../application/content/use-cases/find-question-by-id.use-case';
import { CreateQuestionUseCase } from '../../application/content/use-cases/create-question.use-case';
import { UpdateQuestionUseCase } from '../../application/content/use-cases/update-question.use-case';
import { DeleteQuestionUseCase } from '../../application/content/use-cases/delete-question.use-case';
import { ReorderQuestionsUseCase } from '../../application/content/use-cases/reorder-questions.use-case';
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
