import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { ExamRepository } from '../../../domain/content/repositories/exam.repository';
import { Exam } from '../../../domain/content/entities/exam.entity';
import { ContentReadOptions } from './content-read-options';

@Injectable()
export class FindAllExamsUseCase implements UseCase<
  ContentReadOptions,
  Exam[]
> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(options: ContentReadOptions = {}): Promise<Exam[]> {
    const { includeDraft = false } = options;
    const exams = await this.examRepository.findAll();
    return includeDraft ? exams : exams.filter((e) => e.status === 'PUBLISHED');
  }
}
