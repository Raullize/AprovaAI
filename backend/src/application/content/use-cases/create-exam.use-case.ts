import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { ExamRepository } from '../../../domain/content/repositories/exam.repository';
import { Exam } from '../../../domain/content/entities/exam.entity';
import { CreateExamDto } from '../../../api/exams/dto/exam.dto';
import { generateUniqueSlug } from '../../../shared/utils/slugify';

@Injectable()
export class CreateExamUseCase implements UseCase<CreateExamDto, Exam> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(request: CreateExamDto): Promise<Exam> {
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
      slug,
      description: request.description,
      status: request.status,
      order: count,
    });

    return this.examRepository.create(exam);
  }
}
