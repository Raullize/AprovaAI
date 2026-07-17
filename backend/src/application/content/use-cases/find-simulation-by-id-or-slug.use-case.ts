import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { SimulationRepository } from '../../../domain/content/repositories/simulation.repository';
import { Simulation } from '../../../domain/content/entities/simulation.entity';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';

@Injectable()
export class FindSimulationByIdOrSlugUseCase implements UseCase<string, Simulation> {
  constructor(private readonly simulationRepository: SimulationRepository) {}

  async execute(idOrSlug: string): Promise<Simulation> {
    const simulation =
      (await this.simulationRepository.findById(idOrSlug)) ??
      (await this.simulationRepository.findBySlug(idOrSlug));

    if (!simulation) {
      throw new ResourceNotFoundError('Simulation', idOrSlug);
    }

    return simulation;
  }
}
