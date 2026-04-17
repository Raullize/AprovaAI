import { Module } from '@nestjs/common';
import { LevelsController } from './levels.controller';
import {
  FindAllLevelsUseCase,
  FindLevelsByTopicIdUseCase,
  FindLevelByIdUseCase,
  FindLevelBySlugUseCase,
} from '../../application/content/use-cases/find-levels.use-case';
import { CreateLevelUseCase } from '../../application/content/use-cases/create-level.use-case';
import { UpdateLevelUseCase } from '../../application/content/use-cases/update-level.use-case';
import {
  DeleteLevelUseCase,
  ReorderLevelsUseCase,
} from '../../application/content/use-cases/reorder-delete-levels.use-case';
import { LevelRepository } from '../../domain/content/repositories/level.repository';
import { PrismaLevelRepository } from '../../infrastructure/database/prisma/repositories/prisma-level.repository';

@Module({
  controllers: [LevelsController],
  providers: [
    FindAllLevelsUseCase,
    FindLevelsByTopicIdUseCase,
    FindLevelByIdUseCase,
    FindLevelBySlugUseCase,
    CreateLevelUseCase,
    UpdateLevelUseCase,
    DeleteLevelUseCase,
    ReorderLevelsUseCase,
    {
      provide: LevelRepository,
      useClass: PrismaLevelRepository,
    },
  ],
})
export class LevelsModule {}
