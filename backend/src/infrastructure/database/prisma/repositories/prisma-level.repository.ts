import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LevelRepository } from '../../../../domain/content/repositories/level.repository';
import { Level } from '../../../../domain/content/entities/level.entity';
import { PrismaLevelMapper } from '../mappers/prisma-level.mapper';

@Injectable()
export class PrismaLevelRepository implements LevelRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Level[]> {
    const levels = await this.prisma.level.findMany({
      orderBy: { order: 'asc' },
    });
    return levels.map((level) => PrismaLevelMapper.toDomain(level));
  }

  async findByTopicId(topicId: string): Promise<Level[]> {
    const levels = await this.prisma.level.findMany({
      where: { topicId },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });
    return levels.map((level) => PrismaLevelMapper.toDomain(level));
  }

  async findById(id: string): Promise<Level | null> {
    const level = await this.prisma.level.findUnique({
      where: { id },
    });
    if (!level) return null;
    return PrismaLevelMapper.toDomain(level);
  }

  async findBySlug(slug: string): Promise<Level | null> {
    const level = await this.prisma.level.findFirst({
      where: {
        slug: {
          equals: slug,
          mode: 'insensitive',
        },
      },
    });
    if (!level) return null;
    return PrismaLevelMapper.toDomain(level);
  }

  async findBySlugAndTopicId(
    slug: string,
    topicId: string,
  ): Promise<Level | null> {
    const level = await this.prisma.level.findFirst({
      where: {
        slug: {
          equals: slug,
          mode: 'insensitive',
        },
        topicId,
      },
    });
    if (!level) return null;
    return PrismaLevelMapper.toDomain(level);
  }

  async create(level: Level): Promise<Level> {
    const data = PrismaLevelMapper.toPrisma(level);
    const created = await this.prisma.level.create({ data });
    return PrismaLevelMapper.toDomain(created);
  }

  async save(level: Level): Promise<Level> {
    const data = PrismaLevelMapper.toPrisma(level);
    const updated = await this.prisma.level.update({
      where: { id: level.id },
      data,
    });
    return PrismaLevelMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.level.delete({
      where: { id },
    });
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.level.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );
  }

  async countByTopicId(topicId: string): Promise<number> {
    return this.prisma.level.count({
      where: { topicId },
    });
  }
}
