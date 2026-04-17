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

  async execute(id: string): Promise<Exam> {
    const exam = await this.examRepository.findById(id);
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }
    return exam;
  }
}

@Injectable()
export class FindExamBySlugUseCase implements UseCase<string, Exam> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(slug: string): Promise<Exam> {
    const exam = await this.examRepository.findBySlug(slug);
    if (!exam) {
      throw new NotFoundException(`Exam with slug ${slug} not found`);
    }
    return exam;
  }
}
