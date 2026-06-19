import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { ExamResultRepository } from '../../../domain/simulations/repositories/exam-result.repository';
import { ExamResult } from '../../../domain/simulations/entities/exam-result.entity';

export interface GetSimulationHistoryRequest {
  userId: string;
}

@Injectable()
export class GetSimulationHistoryUseCase implements UseCase<
  GetSimulationHistoryRequest,
  ExamResult[]
> {
  constructor(private readonly examResultRepository: ExamResultRepository) {}

  async execute(request: GetSimulationHistoryRequest): Promise<ExamResult[]> {
    return this.examResultRepository.findHistoryByUserId(request.userId);
  }
}
