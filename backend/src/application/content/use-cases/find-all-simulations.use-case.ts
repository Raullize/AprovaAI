import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { SimulationRepository } from '../../../domain/content/repositories/simulation.repository';
import { Simulation } from '../../../domain/content/entities/simulation.entity';

@Injectable()
export class FindAllSimulationsUseCase implements UseCase<void, Simulation[]> {
  constructor(private readonly simulationRepository: SimulationRepository) {}

  async execute(): Promise<Simulation[]> {
    return this.simulationRepository.findAll();
  }
}
