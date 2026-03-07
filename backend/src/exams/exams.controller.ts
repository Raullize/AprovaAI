import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import {
  createExamSchema,
  updateExamSchema,
  reorderSchema,
} from './dto/exam.dto';
import type { CreateExamDto, UpdateExamDto, ReorderDto } from './dto/exam.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../utils/zod-validation.pipe';

@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.examsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body(new ZodValidationPipe(createExamSchema)) createExamDto: CreateExamDto,
  ) {
    return this.examsService.create(createExamDto);
  }

  @Patch('reorder')
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  reorder(@Body(new ZodValidationPipe(reorderSchema)) reorderDto: ReorderDto) {
    return this.examsService.reorder(reorderDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateExamSchema)) updateExamDto: UpdateExamDto,
  ) {
    return this.examsService.update(id, updateExamDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }
}
