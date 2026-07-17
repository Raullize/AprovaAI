import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { SimulationRepository } from '../../../domain/content/repositories/simulation.repository';
import { Simulation } from '../../../domain/content/entities/simulation.entity';
import { Slug } from '../../../domain/content/value-objects/slug';
import { Percentage } from '../../../domain/content/value-objects/percentage';
import { generateUniqueSlug } from '../../../shared/utils/slugify';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';

export interface UpdateSimulationRequest {
  id: string;
  data: {
    name?: string;
    description?: string;
    status?: 'PUBLISHED' | 'DRAFT';
    topicId?: string;
    xpReward?: number;
    passingPercentage?: number;
    timeLimit?: number | null;
    simulationMode?: 'PRACTICE' | 'EXAM';
  };
}

@Injectable()
export class UpdateSimulationUseCase implements UseCase<UpdateSimulationRequest, Simulation> {
  constructor(private readonly simulationRepository: SimulationRepository) {}

  async execute(request: UpdateSimulationRequest): Promise<Simulation> {
    const simulation: Simulation | null = await this.simulationRepository.findById(request.id);

    if (!simulation) {
      throw new ResourceNotFoundError('Simulation', request.id);
    }

    if (request.data.name && request.data.name !== simulation.name) {
      const slug = await generateUniqueSlug(
        request.data.name,
        async (testSlug: string) => {
          const existing = await this.simulationRepository.findBySlugAndTopicId(
            testSlug,
            simulation.topicId,
          );
          return existing ? existing.id !== request.id : false;
        },
      );

      simulation.updateDetails({
        name: request.data.name,
        description: request.data.description ?? simulation.description,
        slug: Slug.create(slug),
        topicId: request.data.topicId ?? simulation.topicId,
        xpReward: request.data.xpReward ?? simulation.xpReward,
        passingPercentage:
          request.data.passingPercentage !== undefined
            ? Percentage.create(request.data.passingPercentage)
            : Percentage.create(simulation.passingPercentage),
        timeLimit: request.data.timeLimit !== undefined ? request.data.timeLimit : simulation.timeLimit,
        simulationMode: request.data.simulationMode ?? simulation.simulationMode,
      });
    } else if (
      request.data.description !== undefined ||
      request.data.topicId !== undefined ||
      request.data.xpReward !== undefined ||
      request.data.passingPercentage !== undefined ||
      request.data.timeLimit !== undefined ||
      request.data.simulationMode !== undefined
    ) {
      simulation.updateDetails({
        name: simulation.name,
        description: request.data.description ?? simulation.description,
        slug: simulation.slug,
        topicId: request.data.topicId ?? simulation.topicId,
        xpReward: request.data.xpReward ?? simulation.xpReward,
        passingPercentage:
          request.data.passingPercentage !== undefined
            ? Percentage.create(request.data.passingPercentage)
            : Percentage.create(simulation.passingPercentage),
        timeLimit: request.data.timeLimit !== undefined ? request.data.timeLimit : simulation.timeLimit,
        simulationMode: request.data.simulationMode ?? simulation.simulationMode,
      });
    }

    if (request.data.status !== undefined) {
      if (request.data.status === 'PUBLISHED') {
        simulation.activate();
      } else {
        simulation.deactivate();
      }
    }

    return this.simulationRepository.save(simulation);
  }
}
