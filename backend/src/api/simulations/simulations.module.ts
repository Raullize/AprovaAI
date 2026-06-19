import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { SimulationsController } from './simulations.controller';
import { StartSimulationUseCase } from '../../application/simulations/use-cases/start-simulation.use-case';
import { SaveAnswerUseCase } from '../../application/simulations/use-cases/save-answer.use-case';
import { FinishSimulationUseCase } from '../../application/simulations/use-cases/finish-simulation.use-case';
import { GetSimulationHistoryUseCase } from '../../application/simulations/use-cases/get-simulation-history.use-case';
import { ExamResultRepository } from '../../domain/simulations/repositories/exam-result.repository';
import { LevelRepository } from '../../domain/content/repositories/level.repository';
import { QuestionRepository } from '../../domain/content/repositories/question.repository';
import { PrismaExamResultRepository } from '../../infrastructure/database/prisma/repositories/prisma-exam-result.repository';
import { PrismaLevelRepository } from '../../infrastructure/database/prisma/repositories/prisma-level.repository';
import { PrismaQuestionRepository } from '../../infrastructure/database/prisma/repositories/prisma-question.repository';
import { UserRepository } from '../../domain/users/repositories/user.repository';
import { PrismaUserRepository } from '../../infrastructure/database/prisma/repositories/prisma-user.repository';

@Module({
  imports: [PrismaModule],
  controllers: [SimulationsController],
  providers: [
    {
      provide: ExamResultRepository,
      useClass: PrismaExamResultRepository,
    },
    {
      provide: LevelRepository,
      useClass: PrismaLevelRepository,
    },
    {
      provide: QuestionRepository,
      useClass: PrismaQuestionRepository,
    },
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    StartSimulationUseCase,
    SaveAnswerUseCase,
    FinishSimulationUseCase,
    GetSimulationHistoryUseCase,
  ],
})
export class SimulationsModule {}
