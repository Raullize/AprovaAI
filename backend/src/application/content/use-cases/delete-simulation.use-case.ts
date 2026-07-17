import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { SimulationRepository } from '../../../domain/content/repositories/simulation.repository';

@Injectable()
export class DeleteSimulationUseCase implements UseCase<string, void> {
  constructor(private readonly simulationRepository: SimulationRepository) {}

  async execute(id: string): Promise<void> {
    await this.simulationRepository.delete(id);
  }
}
