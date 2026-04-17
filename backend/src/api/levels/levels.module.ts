import { Module } from '@nestjs/common';
import { LevelsController } from './levels.controller';
import { FindAllLevelsUseCase } from '../../application/content/use-cases/find-all-levels.use-case';
import { FindLevelsByTopicIdUseCase } from '../../application/content/use-cases/find-levels-by-topic-id.use-case';
import { FindLevelByIdUseCase } from '../../application/content/use-cases/find-level-by-id.use-case';
import { FindLevelBySlugUseCase } from '../../application/content/use-cases/find-level-by-slug.use-case';
import { CreateLevelUseCase } from '../../application/content/use-cases/create-level.use-case';
import { UpdateLevelUseCase } from '../../application/content/use-cases/update-level.use-case';
import { DeleteLevelUseCase } from '../../application/content/use-cases/delete-level.use-case';
import { ReorderLevelsUseCase } from '../../application/content/use-cases/reorder-levels.use-case';
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
