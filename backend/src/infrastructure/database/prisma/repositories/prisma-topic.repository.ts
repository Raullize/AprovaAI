import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TopicRepository } from '../../../../domain/content/repositories/topic.repository';
import { Topic } from '../../../../domain/content/entities/topic.entity';
import { PrismaTopicMapper } from '../mappers/prisma-topic.mapper';

@Injectable()
export class PrismaTopicRepository implements TopicRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Topic[]> {
    const topics = await this.prisma.topic.findMany({
      orderBy: { order: 'asc' },
    });
    return topics.map((topic) => PrismaTopicMapper.toDomain(topic));
  }

  async findByExamId(examId: string): Promise<Topic[]> {
    const topics = await this.prisma.topic.findMany({
      where: { examId },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { levels: true },
        },
      },
    });
    return topics.map((topic) => PrismaTopicMapper.toDomain(topic));
  }

  async findById(id: string): Promise<Topic | null> {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
    });
    if (!topic) return null;
    return PrismaTopicMapper.toDomain(topic);
  }

  async findBySlug(slug: string): Promise<Topic | null> {
    const topic = await this.prisma.topic.findFirst({
      where: {
        slug: {
          equals: slug,
          mode: 'insensitive',
        },
      },
    });
    if (!topic) return null;
    return PrismaTopicMapper.toDomain(topic);
  }

  async findBySlugAndExamId(
    slug: string,
    examId: string,
  ): Promise<Topic | null> {
    const topic = await this.prisma.topic.findFirst({
      where: {
        slug: {
          equals: slug,
          mode: 'insensitive',
        },
        examId,
      },
    });
    if (!topic) return null;
    return PrismaTopicMapper.toDomain(topic);
  }

  async create(topic: Topic): Promise<Topic> {
    const data = PrismaTopicMapper.toPrisma(topic);
    const created = await this.prisma.topic.create({ data });
    return PrismaTopicMapper.toDomain(created);
  }

  async save(topic: Topic): Promise<Topic> {
    const data = PrismaTopicMapper.toPrisma(topic);
    const updated = await this.prisma.topic.update({
      where: { id: topic.id },
      data,
    });
    return PrismaTopicMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.topic.delete({
      where: { id },
    });
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.topic.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );
  }

  async countByExamId(examId: string): Promise<number> {
    return this.prisma.topic.count({
      where: { examId },
    });
  }
}
