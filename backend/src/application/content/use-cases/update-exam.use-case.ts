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
    status?: 'ACTIVE' | 'INACTIVE';
  };
}

@Injectable()
export class UpdateExamUseCase implements UseCase<UpdateExamRequest, Exam> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(request: UpdateExamRequest): Promise<Exam> {
    const exam = await this.examRepository.findById(request.id);

    if (!exam) {
      throw new ResourceNotFoundError('Exam', request.id);
    }

    const updateData: Record<string, any> = {};

    if (request.data.name && request.data.name !== exam.name) {
      updateData['name'] = request.data.name;

      const slug = await generateUniqueSlug(
        request.data.name,
        async (testSlug: string) => {
          const existing = await this.examRepository.findBySlug(testSlug);
          return existing ? existing.id !== request.id : false;
        },
      );

      updateData['slug'] = Slug.create(slug);
    }

    if (request.data.description !== undefined) {
      updateData['description'] = request.data.description;
    }

    if (request.data.status !== undefined) {
      updateData['status'] = request.data.status;
    }

    return this.examRepository.update(request.id, updateData);
  }
}
