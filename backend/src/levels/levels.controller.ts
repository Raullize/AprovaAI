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
  Query,
} from '@nestjs/common';
import { LevelsService } from './levels.service';
import { createLevelSchema, updateLevelSchema } from './dto/level.dto';
import type { CreateLevelDto, UpdateLevelDto } from './dto/level.dto';
import { reorderSchema } from '../exams/dto/exam.dto';
import type { ReorderDto } from '../exams/dto/exam.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../utils/zod-validation.pipe';

@Controller('levels')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query('topicSlug') topicSlug?: string) {
    return this.levelsService.findAll(topicSlug);
  }

  @Get(':slug')
  @Roles(UserRole.ADMIN)
  findOne(@Param('slug') slug: string) {
    return this.levelsService.findOne(slug);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body(new ZodValidationPipe(createLevelSchema))
    createLevelDto: CreateLevelDto,
  ) {
    return this.levelsService.create(createLevelDto);
  }

  @Patch('reorder')
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  reorder(@Body(new ZodValidationPipe(reorderSchema)) reorderDto: ReorderDto) {
    return this.levelsService.reorder(reorderDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLevelSchema))
    updateLevelDto: UpdateLevelDto,
  ) {
    return this.levelsService.update(id, updateLevelDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.levelsService.remove(id);
  }
}
