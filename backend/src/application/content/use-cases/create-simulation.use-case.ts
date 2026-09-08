import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { SimulationRepository } from '../../../domain/content/repositories/simulation.repository';
import { Simulation } from '../../../domain/content/entities/simulation.entity';
import { Slug } from '../../../domain/content/value-objects/slug';
import { Percentage } from '../../../domain/content/value-objects/percentage';
import { generateUniqueSlug } from '../../../shared/utils/slugify';

export interface CreateSimulationRequest {
  name: string;
  description?: string;
  status?: 'PUBLISHED' | 'DRAFT';
  topicId: string;
  xpReward?: number;
  passingPercentage?: number;
  timeLimit?: number;
  simulationMode?: 'PRACTICE' | 'EXAM';
}

@Injectable()
export class CreateSimulationUseCase implements UseCase<
  CreateSimulationRequest,
  Simulation
> {
  constructor(private readonly simulationRepository: SimulationRepository) {}

  async execute(request: CreateSimulationRequest): Promise<Simulation> {
    const count = await this.simulationRepository.countByTopicId(
      request.topicId,
    );

    const slug = await generateUniqueSlug(
      request.name,
      async (testSlug: string) => {
        const existing = await this.simulationRepository.findBySlugAndTopicId(
          testSlug,
          request.topicId,
        );
        return !!existing;
      },
    );

    const simulation = Simulation.create({
      name: request.name,
      slug: Slug.create(slug),
      description: request.description,
      status: request.status,
      topicId: request.topicId,
      xpReward: request.xpReward,
      passingPercentage:
        request.passingPercentage !== undefined
          ? Percentage.create(request.passingPercentage)
          : undefined,
      timeLimit: request.timeLimit,
      simulationMode: request.simulationMode,
      order: count,
    });

    return this.simulationRepository.create(simulation);
  }
}
