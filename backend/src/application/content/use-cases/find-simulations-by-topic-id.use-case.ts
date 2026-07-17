import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { SimulationRepository } from '../../../domain/content/repositories/simulation.repository';
import { Simulation } from '../../../domain/content/entities/simulation.entity';

@Injectable()
export class FindSimulationsByTopicIdUseCase implements UseCase<string, Simulation[]> {
  constructor(private readonly simulationRepository: SimulationRepository) {}

  async execute(topicId: string): Promise<Simulation[]> {
    return this.simulationRepository.findByTopicId(topicId);
  }
}
