import { Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { ExamRepository } from '../../../domain/content/repositories/exam.repository';
import { Exam } from '../../../domain/content/entities/exam.entity';

@Injectable()
export class FindAllExamsUseCase implements UseCase<void, Exam[]> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(): Promise<Exam[]> {
    return this.examRepository.findAll();
  }
}

@Injectable()
export class FindExamByIdUseCase implements UseCase<string, Exam> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(idOrSlug: string): Promise<Exam> {
    let exam = await this.examRepository.findById(idOrSlug);
    if (!exam) {
      exam = await this.examRepository.findBySlug(idOrSlug);
    }
    if (!exam) {
      throw new NotFoundException(`Exam with ID or slug ${idOrSlug} not found`);
    }
    return exam;
  }
}
