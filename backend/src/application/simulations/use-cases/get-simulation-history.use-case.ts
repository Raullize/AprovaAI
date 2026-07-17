import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { SimulationAttemptRepository } from '../../../domain/simulations/repositories/simulation-attempt.repository';
import { SimulationAttempt } from '../../../domain/simulations/entities/simulation-attempt.entity';

export interface GetSimulationHistoryRequest {
  userId: string;
}

@Injectable()
export class GetSimulationHistoryUseCase implements UseCase<
  GetSimulationHistoryRequest,
  SimulationAttempt[]
> {
  constructor(private readonly simulationAttemptRepository: SimulationAttemptRepository) {}

  async execute(request: GetSimulationHistoryRequest): Promise<SimulationAttempt[]> {
    return this.simulationAttemptRepository.findHistoryByUserId(request.userId);
  }
}
