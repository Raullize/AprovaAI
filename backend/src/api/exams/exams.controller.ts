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

import {
  FindAllExamsUseCase,
  FindExamByIdUseCase,
} from '../../application/content/use-cases/find-exams.use-case';
import { CreateExamUseCase } from '../../application/content/use-cases/create-exam.use-case';
import { UpdateExamUseCase } from '../../application/content/use-cases/update-exam.use-case';
import { DeleteExamUseCase } from '../../application/content/use-cases/delete-exam.use-case';
import { ReorderExamsUseCase } from '../../application/content/use-cases/reorder-exams.use-case';

@Controller('exams')
export class ExamsController {
  constructor(
    private readonly findAllExamsUseCase: FindAllExamsUseCase,
    private readonly findExamByIdUseCase: FindExamByIdUseCase,
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.findExamByIdUseCase.execute(id);
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
