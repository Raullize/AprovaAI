import { Module } from '@nestjs/common';
import { SimulationsController } from './simulations.controller';
import { FindAllSimulationsUseCase } from '../../application/content/use-cases/find-all-simulations.use-case';
import { FindSimulationsByTopicIdUseCase } from '../../application/content/use-cases/find-simulations-by-topic-id.use-case';
import { FindSimulationByIdOrSlugUseCase } from '../../application/content/use-cases/find-simulation-by-id-or-slug.use-case';
import { FindSimulationByIdUseCase } from '../../application/content/use-cases/find-simulation-by-id.use-case';
import { FindSimulationBySlugUseCase } from '../../application/content/use-cases/find-simulation-by-slug.use-case';
import { CreateSimulationUseCase } from '../../application/content/use-cases/create-simulation.use-case';
import { UpdateSimulationUseCase } from '../../application/content/use-cases/update-simulation.use-case';
import { DeleteSimulationUseCase } from '../../application/content/use-cases/delete-simulation.use-case';
import { ReorderSimulationsUseCase } from '../../application/content/use-cases/reorder-simulations.use-case';
import { SimulationRepository } from '../../domain/content/repositories/simulation.repository';
import { PrismaSimulationRepository } from '../../infrastructure/database/prisma/repositories/prisma-simulation.repository';

@Module({
  controllers: [SimulationsController],
  providers: [
    FindAllSimulationsUseCase,
    FindSimulationsByTopicIdUseCase,
    FindSimulationByIdOrSlugUseCase,
    FindSimulationByIdUseCase,
    FindSimulationBySlugUseCase,
    CreateSimulationUseCase,
    UpdateSimulationUseCase,
    DeleteSimulationUseCase,
    ReorderSimulationsUseCase,
    {
      provide: SimulationRepository,
      useClass: PrismaSimulationRepository,
    },
  ],
})
export class SimulationsModule {}
