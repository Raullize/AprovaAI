import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { ExamRepository } from '../../../domain/content/repositories/exam.repository';
import { Exam } from '../../../domain/content/entities/exam.entity';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';
import { ContentReadOptions } from './content-read-options';

@Injectable()
export class FindExamByIdOrSlugUseCase implements UseCase<
  { idOrSlug: string; options?: ContentReadOptions },
  Exam
> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute({
    idOrSlug,
    options = {},
  }: {
    idOrSlug: string;
    options?: ContentReadOptions;
  }): Promise<Exam> {
    const { includeDraft = false } = options;
    const exam =
      (await this.examRepository.findById(idOrSlug)) ??
      (await this.examRepository.findBySlug(idOrSlug));

    if (!exam || (!includeDraft && exam.status !== 'PUBLISHED')) {
      throw new ResourceNotFoundError('Exam', idOrSlug);
    }

    return exam;
  }
}
