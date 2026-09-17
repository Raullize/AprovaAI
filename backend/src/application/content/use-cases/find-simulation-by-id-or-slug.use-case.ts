import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { SimulationRepository } from '../../../domain/content/repositories/simulation.repository';
import { Simulation } from '../../../domain/content/entities/simulation.entity';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';
import { ContentReadOptions } from './content-read-options';

@Injectable()
export class FindSimulationByIdOrSlugUseCase implements UseCase<
  { idOrSlug: string; options?: ContentReadOptions },
  Simulation
> {
  constructor(private readonly simulationRepository: SimulationRepository) {}

  async execute({
    idOrSlug,
    options = {},
  }: {
    idOrSlug: string;
    options?: ContentReadOptions;
  }): Promise<Simulation> {
    const { includeDraft = false } = options;
    const simulation =
      (await this.simulationRepository.findById(idOrSlug)) ??
      (await this.simulationRepository.findBySlug(idOrSlug));

    if (!simulation || (!includeDraft && simulation.status !== 'PUBLISHED')) {
      throw new ResourceNotFoundError('Simulation', idOrSlug);
    }

    return simulation;
  }
}
