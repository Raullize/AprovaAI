import { Topic as PrismaTopic } from '@prisma/client';
import { Topic } from '../../../../domain/content/entities/topic.entity';

export class PrismaTopicMapper {
  static toDomain(raw: PrismaTopic & { _count?: { levels: number } }): Topic {
    return Topic.create(
      {
        name: raw.name,
        slug: raw.slug,
        description: raw.description,
        status: raw.status,
        order: raw.order,
        examId: raw.examId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        ...(raw._count ? { _count: raw._count } : {}),
      },
      raw.id,
    );
  }

  static toPrisma(topic: Topic): PrismaTopic {
    return {
      id: topic.id,
      name: topic.name,
      slug: topic.slug,
      description: topic.description ?? null,
      status: topic.status,
      order: topic.order,
      examId: topic.examId,
      createdAt: topic.createdAt ?? new Date(),
      updatedAt: topic.updatedAt ?? new Date(),
    };
  }
}
