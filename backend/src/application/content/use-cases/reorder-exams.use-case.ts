import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { ExamRepository } from '../../../domain/content/repositories/exam.repository';

export interface ReorderExamsRequest {
  ids: string[];
}

@Injectable()
export class ReorderExamsUseCase implements UseCase<ReorderExamsRequest, void> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(request: ReorderExamsRequest): Promise<void> {
    await this.examRepository.reorder(request.ids);
  }
}
