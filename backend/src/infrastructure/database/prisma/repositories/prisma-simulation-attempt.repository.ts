import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SimulationAttemptRepository } from '../../../../domain/simulations/repositories/simulation-attempt.repository';
import {
  SimulationAttempt,
  AttemptAnswer,
} from '../../../../domain/simulations/entities/simulation-attempt.entity';
import { PrismaSimulationAttemptMapper } from '../mappers/prisma-simulation-attempt.mapper';

@Injectable()
export class PrismaSimulationAttemptRepository implements SimulationAttemptRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<SimulationAttempt | null> {
    const result = await this.prisma.simulationAttempt.findUnique({
      where: { id },
      include: { answers: true },
    });
    if (!result) return null;
    return PrismaSimulationAttemptMapper.toDomain(result);
  }

  async findActiveByUserIdAndSimulationId(
    userId: string,
    simulationId: string,
  ): Promise<SimulationAttempt | null> {
    const result = await this.prisma.simulationAttempt.findFirst({
      where: {
        userId,
        simulationId,
        status: 'IN_PROGRESS',
      },
      include: { answers: true },
    });
    if (!result) return null;
    return PrismaSimulationAttemptMapper.toDomain(result);
  }

  async findHistoryByUserId(userId: string): Promise<SimulationAttempt[]> {
    const results = await this.prisma.simulationAttempt.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      include: {
        answers: true,
        simulation: {
          include: {
            topic: {
              include: {
                exam: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return results.map((result) =>
      PrismaSimulationAttemptMapper.toDomain(result),
    );
  }

  async create(
    simulationAttempt: SimulationAttempt,
  ): Promise<SimulationAttempt> {
    const data = PrismaSimulationAttemptMapper.toPrisma(simulationAttempt);
    const created = await this.prisma.simulationAttempt.create({ data });
    return PrismaSimulationAttemptMapper.toDomain(created);
  }

  async save(simulationAttempt: SimulationAttempt): Promise<SimulationAttempt> {
    const data = PrismaSimulationAttemptMapper.toPrisma(simulationAttempt);
    const updated = await this.prisma.simulationAttempt.update({
      where: { id: simulationAttempt.id },
      data,
    });
    return PrismaSimulationAttemptMapper.toDomain(updated);
  }

  async saveAnswer(answer: AttemptAnswer): Promise<AttemptAnswer> {
    const data = PrismaSimulationAttemptMapper.answerToPrisma(answer);

    const saved = await this.prisma.attemptAnswer.upsert({
      where: {
        simulationAttemptId_questionId: {
          simulationAttemptId: answer.simulationAttemptId,
          questionId: answer.questionId,
        },
      },
      update: {
        selectedOptions: data.selectedOptions,
        isCorrect: data.isCorrect,
        timeSpent: data.timeSpent,
        isFlaggedForReview: data.isFlaggedForReview,
        updatedAt: new Date(),
      },
      create: data,
    });

    return AttemptAnswer.create(
      {
        simulationAttemptId: saved.simulationAttemptId,
        questionId: saved.questionId,
        selectedOptions: saved.selectedOptions,
        isCorrect: saved.isCorrect,
        timeSpent: saved.timeSpent,
        isFlaggedForReview: saved.isFlaggedForReview,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      },
      saved.id,
    );
  }
}
