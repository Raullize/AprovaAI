import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { ExamRepository } from '../../../domain/content/repositories/exam.repository';
import { Exam } from '../../../domain/content/entities/exam.entity';
import { Slug } from '../../../domain/content/value-objects/slug';
import { generateUniqueSlug } from '../../../shared/utils/slugify';

export interface CreateExamRequest {
  name: string;
  description?: string;
  status?: 'PUBLISHED' | 'DRAFT';
  iconKey?: string;
  colorScheme?: string;
  category?: string;
}

@Injectable()
export class CreateExamUseCase implements UseCase<CreateExamRequest, Exam> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(request: CreateExamRequest): Promise<Exam> {
    const count = await this.examRepository.count();

    const slug = await generateUniqueSlug(
      request.name,
      async (testSlug: string) => {
        const existing = await this.examRepository.findBySlug(testSlug);
        return !!existing;
      },
    );

    const exam = Exam.create({
      name: request.name,
      slug: Slug.create(slug),
      description: request.description,
      status: request.status,
      order: count,
      iconKey: request.iconKey,
      colorScheme: request.colorScheme,
      category: request.category,
    });

    return this.examRepository.create(exam);
  }
}
