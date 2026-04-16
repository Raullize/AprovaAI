import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { ExamRepository } from '../../../domain/content/repositories/exam.repository';

@Injectable()
export class DeleteExamUseCase implements UseCase<string, void> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(id: string): Promise<void> {
    await this.examRepository.delete(id);
  }
}
