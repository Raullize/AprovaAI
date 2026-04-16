import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { ExamRepository } from '../../../domain/content/repositories/exam.repository';
import { ReorderDto } from '../../../api/exams/dto/exam.dto';

@Injectable()
export class ReorderExamsUseCase implements UseCase<ReorderDto, void> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(request: ReorderDto): Promise<void> {
    await this.examRepository.reorder(request.ids);
  }
}
