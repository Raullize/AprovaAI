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
import { createTopicSchema, updateTopicSchema } from './dto/topic.dto';
import type { CreateTopicDto, UpdateTopicDto } from './dto/topic.dto';
import { reorderSchema } from '../exams/dto/exam.dto';
import type { ReorderDto } from '../exams/dto/exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';

import {
  FindAllTopicsUseCase,
  FindTopicsByExamIdUseCase,
  FindTopicByIdUseCase,
  FindTopicBySlugUseCase,
} from '../../application/content/use-cases/find-topics.use-case';
import { CreateTopicUseCase } from '../../application/content/use-cases/create-topic.use-case';
import { UpdateTopicUseCase } from '../../application/content/use-cases/update-topic.use-case';
import {
  DeleteTopicUseCase,
  ReorderTopicsUseCase,
} from '../../application/content/use-cases/reorder-delete-topics.use-case';

@Controller('topics')
export class TopicsController {
  constructor(
    private readonly findAllTopicsUseCase: FindAllTopicsUseCase,
    private readonly findTopicsByExamIdUseCase: FindTopicsByExamIdUseCase,
    private readonly findTopicByIdUseCase: FindTopicByIdUseCase,
    private readonly findTopicBySlugUseCase: FindTopicBySlugUseCase,
    private readonly createTopicUseCase: CreateTopicUseCase,
    private readonly updateTopicUseCase: UpdateTopicUseCase,
    private readonly deleteTopicUseCase: DeleteTopicUseCase,
    private readonly reorderTopicsUseCase: ReorderTopicsUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Body(new ZodValidationPipe(createTopicSchema))
    createTopicDto: CreateTopicDto,
  ) {
    return this.createTopicUseCase.execute(createTopicDto);
  }

  @Get()
  findAll() {
    return this.findAllTopicsUseCase.execute();
  }

  @Get('exam/:examId')
  findByExam(@Param('examId') examId: string) {
    return this.findTopicsByExamIdUseCase.execute(examId);
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );
    if (isUUID) {
      return this.findTopicByIdUseCase.execute(idOrSlug);
    }
    return this.findTopicBySlugUseCase.execute(idOrSlug);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  reorder(@Body(new ZodValidationPipe(reorderSchema)) reorderDto: ReorderDto) {
    return this.reorderTopicsUseCase.execute(reorderDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTopicSchema))
    updateTopicDto: UpdateTopicDto,
  ) {
    return this.updateTopicUseCase.execute({ id, data: updateTopicDto });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.deleteTopicUseCase.execute(id);
  }
}
