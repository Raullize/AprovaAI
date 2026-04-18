import { Level as PrismaLevel } from '@prisma/client';
import { Level } from '../../../../domain/content/entities/level.entity';
import { Slug } from '../../../../domain/content/value-objects/slug';
import { Percentage } from '../../../../domain/content/value-objects/percentage';

export class PrismaLevelMapper {
  static toDomain(
    raw: PrismaLevel & { _count?: { questions: number } },
  ): Level {
    return Level.create(
      {
        name: raw.name,
        slug: Slug.create(raw.slug),
        description: raw.description,
        order: raw.order,
        topicId: raw.topicId,
        status: raw.status,
        xpReward: raw.xpReward,
        passingPercentage: Percentage.create(raw.passingPercentage),
        questionsCount: raw._count?.questions,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPrisma(level: Level): PrismaLevel {
    return {
      id: level.id,
      name: level.name,
      slug: level.slug.value,
      description: level.description ?? null,
      order: level.order,
      topicId: level.topicId,
      status: level.status,
      xpReward: level.xpReward,
      passingPercentage: level.passingPercentage,
      createdAt: level.createdAt ?? new Date(),
      updatedAt: level.updatedAt ?? new Date(),
    };
  }
}
