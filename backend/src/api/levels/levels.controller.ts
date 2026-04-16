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

import {
  FindAllLevelsUseCase,
  FindLevelsByTopicIdUseCase,
  FindLevelByIdUseCase,
} from '../../application/content/use-cases/find-levels.use-case';
import { CreateLevelUseCase } from '../../application/content/use-cases/create-level.use-case';
import { UpdateLevelUseCase } from '../../application/content/use-cases/update-level.use-case';
import {
  DeleteLevelUseCase,
  ReorderLevelsUseCase,
} from '../../application/content/use-cases/reorder-delete-levels.use-case';

@Controller('levels')
export class LevelsController {
  constructor(
    private readonly findAllLevelsUseCase: FindAllLevelsUseCase,
    private readonly findLevelsByTopicIdUseCase: FindLevelsByTopicIdUseCase,
    private readonly findLevelByIdUseCase: FindLevelByIdUseCase,
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.findLevelByIdUseCase.execute(id);
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
