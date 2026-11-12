import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { SimulationRepository } from '../../../domain/content/repositories/simulation.repository';
import { Simulation } from '../../../domain/content/entities/simulation.entity';
import { ContentReadOptions } from './content-read-options';

@Injectable()
export class FindSimulationsByTopicIdUseCase implements UseCase<
  { topicId: string; options?: ContentReadOptions },
  Simulation[]
> {
  constructor(private readonly simulationRepository: SimulationRepository) {}

  async execute({
    topicId,
    options = {},
  }: {
    topicId: string;
    options?: ContentReadOptions;
  }): Promise<Simulation[]> {
    const { includeDraft = false } = options;
    const simulations = await this.simulationRepository.findByTopicId(topicId);
    return includeDraft
      ? simulations
      : simulations.filter((s) => s.status === 'PUBLISHED');
  }
}
