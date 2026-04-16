import { Module } from '@nestjs/common';
import { ExamsController } from './exams.controller';
import {
  FindAllExamsUseCase,
  FindExamByIdUseCase,
} from '../../application/content/use-cases/find-exams.use-case';
import { CreateExamUseCase } from '../../application/content/use-cases/create-exam.use-case';
import { UpdateExamUseCase } from '../../application/content/use-cases/update-exam.use-case';
import { DeleteExamUseCase } from '../../application/content/use-cases/delete-exam.use-case';
import { ReorderExamsUseCase } from '../../application/content/use-cases/reorder-exams.use-case';
import { ExamRepository } from '../../domain/content/repositories/exam.repository';
import { PrismaExamRepository } from '../../infrastructure/database/prisma/repositories/prisma-exam.repository';

@Module({
  controllers: [ExamsController],
  providers: [
    FindAllExamsUseCase,
    FindExamByIdUseCase,
    CreateExamUseCase,
    UpdateExamUseCase,
    DeleteExamUseCase,
    ReorderExamsUseCase,
    {
      provide: ExamRepository,
      useClass: PrismaExamRepository,
    },
  ],
})
export class ExamsModule {}
