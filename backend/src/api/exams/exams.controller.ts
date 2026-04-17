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
import {
  createExamSchema,
  updateExamSchema,
  reorderSchema,
} from './dto/exam.dto';
import type { CreateExamDto, UpdateExamDto, ReorderDto } from './dto/exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';

import { FindAllExamsUseCase } from '../../application/content/use-cases/find-all-exams.use-case';
import { FindExamByIdUseCase } from '../../application/content/use-cases/find-exam-by-id.use-case';
import { FindExamBySlugUseCase } from '../../application/content/use-cases/find-exam-by-slug.use-case';
import { CreateExamUseCase } from '../../application/content/use-cases/create-exam.use-case';
import { UpdateExamUseCase } from '../../application/content/use-cases/update-exam.use-case';
import { DeleteExamUseCase } from '../../application/content/use-cases/delete-exam.use-case';
import { ReorderExamsUseCase } from '../../application/content/use-cases/reorder-exams.use-case';

@Controller('exams')
export class ExamsController {
  constructor(
    private readonly findAllExamsUseCase: FindAllExamsUseCase,
    private readonly findExamByIdUseCase: FindExamByIdUseCase,
    private readonly findExamBySlugUseCase: FindExamBySlugUseCase,
    private readonly createExamUseCase: CreateExamUseCase,
    private readonly updateExamUseCase: UpdateExamUseCase,
    private readonly deleteExamUseCase: DeleteExamUseCase,
    private readonly reorderExamsUseCase: ReorderExamsUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Body(new ZodValidationPipe(createExamSchema)) createExamDto: CreateExamDto,
  ) {
    return this.createExamUseCase.execute(createExamDto);
  }

  @Get()
  findAll() {
    return this.findAllExamsUseCase.execute();
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    const isUuidFormat =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    if (isUuidFormat) {
      return this.findExamByIdUseCase.execute(idOrSlug);
    }
    return this.findExamBySlugUseCase.execute(idOrSlug);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  reorder(@Body(new ZodValidationPipe(reorderSchema)) reorderDto: ReorderDto) {
    return this.reorderExamsUseCase.execute(reorderDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateExamSchema)) updateExamDto: UpdateExamDto,
  ) {
    return this.updateExamUseCase.execute({ id, data: updateExamDto });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.deleteExamUseCase.execute(id);
  }
}
