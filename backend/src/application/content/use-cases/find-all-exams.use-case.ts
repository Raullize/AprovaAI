import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { ExamRepository } from '../../../domain/content/repositories/exam.repository';
import { Exam } from '../../../domain/content/entities/exam.entity';

@Injectable()
export class FindAllExamsUseCase implements UseCase<void, Exam[]> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(): Promise<Exam[]> {
    return this.examRepository.findAll();
  }
}
