import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { SimulationRepository } from '../../../domain/content/repositories/simulation.repository';
import { Simulation } from '../../../domain/content/entities/simulation.entity';
import { ContentReadOptions } from './content-read-options';

@Injectable()
export class FindAllSimulationsUseCase implements UseCase<
  ContentReadOptions,
  Simulation[]
> {
  constructor(private readonly simulationRepository: SimulationRepository) {}

  async execute(options: ContentReadOptions = {}): Promise<Simulation[]> {
    const { includeDraft = false } = options;
    const simulations = await this.simulationRepository.findAll();
    return includeDraft
      ? simulations
      : simulations.filter((s) => s.status === 'PUBLISHED');
  }
}
