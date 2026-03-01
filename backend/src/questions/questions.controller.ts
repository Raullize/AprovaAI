import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, HttpCode, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { createQuestionSchema, updateQuestionSchema } from './dto/question.dto';
import type { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';
import { reorderSchema } from '../exams/dto/exam.dto';
import type { ReorderDto } from '../exams/dto/exam.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../utils/zod-validation.pipe';

@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionsController {
    constructor(private readonly questionsService: QuestionsService) { }

    @Get()
    @Roles(UserRole.ADMIN)
    findAll(@Query('levelId') levelId?: string) {
        return this.questionsService.findAll(levelId);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN)
    findOne(@Param('id') id: string) {
        return this.questionsService.findOne(id);
    }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body(new ZodValidationPipe(createQuestionSchema)) createQuestionDto: CreateQuestionDto) {
        return this.questionsService.create(createQuestionDto);
    }

    @Patch('reorder')
    @Roles(UserRole.ADMIN)
    @HttpCode(204)
    reorder(@Body(new ZodValidationPipe(reorderSchema)) reorderDto: ReorderDto) {
        return this.questionsService.reorder(reorderDto);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body(new ZodValidationPipe(updateQuestionSchema)) updateQuestionDto: UpdateQuestionDto) {
        return this.questionsService.update(id, updateQuestionDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(204)
    remove(@Param('id') id: string) {
        return this.questionsService.remove(id);
    }
}
