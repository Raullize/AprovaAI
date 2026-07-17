import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { ExamRepository } from '../../../domain/content/repositories/exam.repository';
import { Exam } from '../../../domain/content/entities/exam.entity';
import { Slug } from '../../../domain/content/value-objects/slug';
import { generateUniqueSlug } from '../../../shared/utils/slugify';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';

export interface UpdateExamRequest {
  id: string;
  data: {
    name?: string;
    description?: string;
    status?: 'PUBLISHED' | 'DRAFT';
    iconKey?: string | null;
    colorScheme?: string | null;
    category?: string | null;
  };
}

@Injectable()
export class UpdateExamUseCase implements UseCase<UpdateExamRequest, Exam> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(request: UpdateExamRequest): Promise<Exam> {
    const exam: Exam | null = await this.examRepository.findById(request.id);

    if (!exam) {
      throw new ResourceNotFoundError('Exam', request.id);
    }

    if (request.data.name && request.data.name !== exam.name) {
      const slug = await generateUniqueSlug(
        request.data.name,
        async (testSlug: string) => {
          const existing = await this.examRepository.findBySlug(testSlug);
          return existing ? existing.id !== request.id : false;
        },
      );
      exam.updateDetails({
        name: request.data.name,
        description: request.data.description ?? exam.description,
        slug: Slug.create(slug),
        iconKey: request.data.iconKey,
        colorScheme: request.data.colorScheme,
        category: request.data.category,
      });
    } else if (
      request.data.description !== undefined ||
      request.data.iconKey !== undefined ||
      request.data.colorScheme !== undefined ||
      request.data.category !== undefined
    ) {
      exam.updateDetails({
        name: exam.name,
        description: request.data.description ?? exam.description,
        slug: exam.slug,
        iconKey: request.data.iconKey,
        colorScheme: request.data.colorScheme,
        category: request.data.category,
      });
    }

    if (request.data.status !== undefined) {
      if (request.data.status === 'PUBLISHED') {
        exam.activate();
      } else {
        exam.deactivate();
      }
    }

    return this.examRepository.save(exam);
  }
}
