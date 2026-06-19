import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { ExamRepository } from '../../../domain/content/repositories/exam.repository';
import { Exam } from '../../../domain/content/entities/exam.entity';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';

@Injectable()
export class FindExamByIdOrSlugUseCase implements UseCase<string, Exam> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(idOrSlug: string): Promise<Exam> {
    const exam =
      (await this.examRepository.findById(idOrSlug)) ??
      (await this.examRepository.findBySlug(idOrSlug));

    if (!exam) {
      throw new ResourceNotFoundError('Exam', idOrSlug);
    }

    return exam;
  }
}
