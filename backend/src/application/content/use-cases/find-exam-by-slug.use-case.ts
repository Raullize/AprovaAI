import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { ExamRepository } from '../../../domain/content/repositories/exam.repository';
import { Exam } from '../../../domain/content/entities/exam.entity';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';

@Injectable()
export class FindExamBySlugUseCase implements UseCase<string, Exam> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(slug: string): Promise<Exam> {
    const exam = await this.examRepository.findBySlug(slug);
    if (!exam) {
      throw new ResourceNotFoundError('Exam (slug)', slug);
    }
    return exam;
  }
}
