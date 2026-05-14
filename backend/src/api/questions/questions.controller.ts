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
  createQuestionSchema,
  updateQuestionSchema,
  CreateQuestionDto,
  UpdateQuestionDto,
} from './dto/question.dto';
import { reorderSchema, ReorderDto } from '../exams/dto/exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';

import { FindAllQuestionsUseCase } from '../../application/content/use-cases/find-all-questions.use-case';
import { FindQuestionsByLevelIdUseCase } from '../../application/content/use-cases/find-questions-by-level-id.use-case';
import { FindQuestionByIdUseCase } from '../../application/content/use-cases/find-question-by-id.use-case';
import { CreateQuestionUseCase } from '../../application/content/use-cases/create-question.use-case';
import { UpdateQuestionUseCase } from '../../application/content/use-cases/update-question.use-case';
import { DeleteQuestionUseCase } from '../../application/content/use-cases/delete-question.use-case';
import { ReorderQuestionsUseCase } from '../../application/content/use-cases/reorder-questions.use-case';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly findAllQuestionsUseCase: FindAllQuestionsUseCase,
    private readonly findQuestionsByLevelIdUseCase: FindQuestionsByLevelIdUseCase,
    private readonly findQuestionByIdUseCase: FindQuestionByIdUseCase,
    private readonly createQuestionUseCase: CreateQuestionUseCase,
    private readonly updateQuestionUseCase: UpdateQuestionUseCase,
    private readonly deleteQuestionUseCase: DeleteQuestionUseCase,
    private readonly reorderQuestionsUseCase: ReorderQuestionsUseCase,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Body(new ZodValidationPipe(createQuestionSchema))
    createQuestionDto: CreateQuestionDto,
  ) {
    return this.createQuestionUseCase.execute(createQuestionDto);
  }

  @Get()
  findAll() {
    return this.findAllQuestionsUseCase.execute();
  }

  @Get('level/:levelId')
  findByLevel(@Param('levelId') levelId: string) {
    return this.findQuestionsByLevelIdUseCase.execute(levelId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.findQuestionByIdUseCase.execute(id);
  }

  @Patch('reorder')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  reorder(@Body(new ZodValidationPipe(reorderSchema)) reorderDto: ReorderDto) {
    return this.reorderQuestionsUseCase.execute(reorderDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateQuestionSchema))
    updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.updateQuestionUseCase.execute({ id, data: updateQuestionDto });
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.deleteQuestionUseCase.execute(id);
  }
}
