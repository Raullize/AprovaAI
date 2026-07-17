import { Simulation as PrismaSimulation } from '@prisma/client';
import { Simulation } from '../../../../domain/content/entities/simulation.entity';
import { Slug } from '../../../../domain/content/value-objects/slug';
import { Percentage } from '../../../../domain/content/value-objects/percentage';

export class PrismaSimulationMapper {
  static toDomain(
    raw: PrismaSimulation & { _count?: { questions: number } },
  ): Simulation {
    return Simulation.create(
      {
        name: raw.name,
        slug: Slug.create(raw.slug),
        description: raw.description,
        order: raw.order,
        topicId: raw.topicId,
        status: raw.status,
        xpReward: raw.xpReward,
        passingPercentage: Percentage.create(raw.passingPercentage),
        timeLimit: raw.timeLimit,
        simulationMode: raw.simulationMode as 'PRACTICE' | 'EXAM',
        questionsCount: raw._count?.questions,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPrisma(simulation: Simulation): PrismaSimulation {
    return {
      id: simulation.id,
      name: simulation.name,
      slug: simulation.slug.value,
      description: simulation.description ?? null,
      order: simulation.order,
      topicId: simulation.topicId,
      status: simulation.status,
      xpReward: simulation.xpReward,
      passingPercentage: simulation.passingPercentage,
      timeLimit: simulation.timeLimit ?? null,
      simulationMode: simulation.simulationMode,
      createdAt: simulation.createdAt ?? new Date(),
      updatedAt: simulation.updatedAt ?? new Date(),
    };
  }
}
