import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { createLevelSchema, updateLevelSchema } from './dto/level.dto';
import type { CreateLevelDto, UpdateLevelDto } from './dto/level.dto';
import { reorderSchema } from '../exams/dto/exam.dto';
import type { ReorderDto } from '../exams/dto/exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';

import { FindAllLevelsUseCase } from '../../application/content/use-cases/find-all-levels.use-case';
import { FindLevelsByTopicIdUseCase } from '../../application/content/use-cases/find-levels-by-topic-id.use-case';
import { FindLevelByIdUseCase } from '../../application/content/use-cases/find-level-by-id.use-case';
import { FindLevelBySlugUseCase } from '../../application/content/use-cases/find-level-by-slug.use-case';
import { CreateLevelUseCase } from '../../application/content/use-cases/create-level.use-case';
import { UpdateLevelUseCase } from '../../application/content/use-cases/update-level.use-case';
import { DeleteLevelUseCase } from '../../application/content/use-cases/delete-level.use-case';
import { ReorderLevelsUseCase } from '../../application/content/use-cases/reorder-levels.use-case';

@Controller('levels')
export class LevelsController {
  constructor(
    private readonly findAllLevelsUseCase: FindAllLevelsUseCase,
    private readonly findLevelsByTopicIdUseCase: FindLevelsByTopicIdUseCase,
    private readonly findLevelByIdUseCase: FindLevelByIdUseCase,
    private readonly findLevelBySlugUseCase: FindLevelBySlugUseCase,
    private readonly createLevelUseCase: CreateLevelUseCase,
    private readonly updateLevelUseCase: UpdateLevelUseCase,
    private readonly deleteLevelUseCase: DeleteLevelUseCase,
    private readonly reorderLevelsUseCase: ReorderLevelsUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Body(new ZodValidationPipe(createLevelSchema))
    createLevelDto: CreateLevelDto,
  ) {
    return this.createLevelUseCase.execute(createLevelDto);
  }

  @Get()
  findAll() {
    return this.findAllLevelsUseCase.execute();
  }

  @Get('topic/:topicId')
  findByTopic(@Param('topicId') topicId: string) {
    return this.findLevelsByTopicIdUseCase.execute(topicId);
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    const isUuidFormat =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    if (isUuidFormat) {
      return this.findLevelByIdUseCase.execute(idOrSlug);
    }
    return this.findLevelBySlugUseCase.execute(idOrSlug);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  reorder(@Body(new ZodValidationPipe(reorderSchema)) reorderDto: ReorderDto) {
    return this.reorderLevelsUseCase.execute(reorderDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLevelSchema))
    updateLevelDto: UpdateLevelDto,
  ) {
    return this.updateLevelUseCase.execute({ id, data: updateLevelDto });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.deleteLevelUseCase.execute(id);
  }
}
