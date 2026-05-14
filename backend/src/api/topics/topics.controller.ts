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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  createTopicSchema,
  updateTopicSchema,
  CreateTopicDto,
  UpdateTopicDto,
} from './dto/topic.dto';
import { reorderSchema, ReorderDto } from '../exams/dto/exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';

import { FindAllTopicsUseCase } from '../../application/content/use-cases/find-all-topics.use-case';
import { FindTopicsByExamIdUseCase } from '../../application/content/use-cases/find-topics-by-exam-id.use-case';
import { FindTopicByIdUseCase } from '../../application/content/use-cases/find-topic-by-id.use-case';
import { FindTopicBySlugUseCase } from '../../application/content/use-cases/find-topic-by-slug.use-case';
import { CreateTopicUseCase } from '../../application/content/use-cases/create-topic.use-case';
import { UpdateTopicUseCase } from '../../application/content/use-cases/update-topic.use-case';
import { DeleteTopicUseCase } from '../../application/content/use-cases/delete-topic.use-case';
import { ReorderTopicsUseCase } from '../../application/content/use-cases/reorder-topics.use-case';

@ApiTags('Topics')
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
  @ApiBearerAuth()
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
    const isUuidFormat =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    if (isUuidFormat) {
      return this.findTopicByIdUseCase.execute(idOrSlug);
    }
    return this.findTopicBySlugUseCase.execute(idOrSlug);
  }

  @Patch('reorder')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  reorder(@Body(new ZodValidationPipe(reorderSchema)) reorderDto: ReorderDto) {
    return this.reorderTopicsUseCase.execute(reorderDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.deleteTopicUseCase.execute(id);
  }
}
