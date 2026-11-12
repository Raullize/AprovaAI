import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ContentGenerationRepository } from '../../../../domain/content/repositories/content-generation.repository';
import { Question } from '../../../../domain/content/entities/question.entity';
import { Simulation } from '../../../../domain/content/entities/simulation.entity';
import { PrismaSimulationMapper } from '../mappers/prisma-simulation.mapper';

@Injectable()
export class PrismaContentGenerationRepository implements ContentGenerationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSimulationWithQuestions(
    simulation: Simulation,
    questions: Question[],
  ): Promise<Simulation> {
    const created = await this.prisma.simulation.create({
      data: {
        ...PrismaSimulationMapper.toPrisma(simulation),
        questions: {
          create: questions.map((question) => ({
            content: question.content,
            imageUrl: question.imageUrl ?? null,
            type: question.type,
            status: question.status,
            order: question.order,
            explanation: question.explanation ?? null,
            studyLink: question.studyLink ?? null,
            source: question.source,
            sourceRef: question.sourceRef ?? null,
            aiModel: question.aiModel ?? null,
            options: {
              create: question.options.map((option) => ({
                text: option.text,
                isCorrect: option.isCorrect ?? false,
                order: option.order,
              })),
            },
          })),
        },
      },
      include: {
        _count: { select: { questions: true } },
      },
    });

    return PrismaSimulationMapper.toDomain(created);
  }
}
