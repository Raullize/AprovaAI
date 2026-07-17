import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SimulationRepository } from '../../../../domain/content/repositories/simulation.repository';
import { Simulation } from '../../../../domain/content/entities/simulation.entity';
import { PrismaSimulationMapper } from '../mappers/prisma-simulation.mapper';

@Injectable()
export class PrismaSimulationRepository implements SimulationRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Simulation[]> {
    const simulations = await this.prisma.simulation.findMany({
      orderBy: { order: 'asc' },
    });
    return simulations.map((simulation) => PrismaSimulationMapper.toDomain(simulation));
  }

  async findByTopicId(topicId: string): Promise<Simulation[]> {
    const simulations = await this.prisma.simulation.findMany({
      where: { topicId },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });
    return simulations.map((simulation) => PrismaSimulationMapper.toDomain(simulation));
  }

  async findById(id: string): Promise<Simulation | null> {
    const simulation = await this.prisma.simulation.findUnique({
      where: { id },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });
    if (!simulation) return null;
    return PrismaSimulationMapper.toDomain(simulation);
  }

  async findBySlug(slug: string): Promise<Simulation | null> {
    const simulation = await this.prisma.simulation.findFirst({
      where: {
        slug: {
          equals: slug,
          mode: 'insensitive',
        },
      },
    });
    if (!simulation) return null;
    return PrismaSimulationMapper.toDomain(simulation);
  }

  async findBySlugAndTopicId(
    slug: string,
    topicId: string,
  ): Promise<Simulation | null> {
    const simulation = await this.prisma.simulation.findFirst({
      where: {
        slug: {
          equals: slug,
          mode: 'insensitive',
        },
        topicId,
      },
    });
    if (!simulation) return null;
    return PrismaSimulationMapper.toDomain(simulation);
  }

  async create(simulation: Simulation): Promise<Simulation> {
    const data = PrismaSimulationMapper.toPrisma(simulation);
    const created = await this.prisma.simulation.create({ data });
    return PrismaSimulationMapper.toDomain(created);
  }

  async save(simulation: Simulation): Promise<Simulation> {
    const data = PrismaSimulationMapper.toPrisma(simulation);
    const updated = await this.prisma.simulation.update({
      where: { id: simulation.id },
      data,
    });
    return PrismaSimulationMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.simulation.delete({
      where: { id },
    });
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.simulation.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );
  }

  async countByTopicId(topicId: string): Promise<number> {
    return this.prisma.simulation.count({
      where: { topicId },
    });
  }
}
