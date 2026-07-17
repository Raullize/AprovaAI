import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { SimulationAttemptsController } from './simulation-attempts.controller';
import { StartSimulationUseCase } from '../../application/simulations/use-cases/start-simulation.use-case';
import { SaveAnswerUseCase } from '../../application/simulations/use-cases/save-answer.use-case';
import { FinishSimulationUseCase } from '../../application/simulations/use-cases/finish-simulation.use-case';
import { GetSimulationHistoryUseCase } from '../../application/simulations/use-cases/get-simulation-history.use-case';
import { SimulationAttemptRepository } from '../../domain/simulations/repositories/simulation-attempt.repository';
import { SimulationRepository } from '../../domain/content/repositories/simulation.repository';
import { QuestionRepository } from '../../domain/content/repositories/question.repository';
import { PrismaSimulationAttemptRepository } from '../../infrastructure/database/prisma/repositories/prisma-simulation-attempt.repository';
import { PrismaSimulationRepository } from '../../infrastructure/database/prisma/repositories/prisma-simulation.repository';
import { PrismaQuestionRepository } from '../../infrastructure/database/prisma/repositories/prisma-question.repository';
import { UserRepository } from '../../domain/users/repositories/user.repository';
import { PrismaUserRepository } from '../../infrastructure/database/prisma/repositories/prisma-user.repository';

@Module({
  imports: [PrismaModule],
  controllers: [SimulationAttemptsController],
  providers: [
    {
      provide: SimulationAttemptRepository,
      useClass: PrismaSimulationAttemptRepository,
    },
    {
      provide: SimulationRepository,
      useClass: PrismaSimulationRepository,
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
export class SimulationAttemptsModule {}
