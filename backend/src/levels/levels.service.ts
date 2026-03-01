import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLevelDto, UpdateLevelDto } from './dto/level.dto';
import { ReorderDto } from '../exams/dto/exam.dto';
import { generateSlug, generateUniqueSlug } from '../utils/slugify';

@Injectable()
export class LevelsService {
  constructor(private prisma: PrismaService) {}

  async findAll(topicId?: string) {
    return this.prisma.level.findMany({
      where: topicId ? { topicId } : undefined,
      include: {
        topic: {
          select: { name: true, examId: true },
        },
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const level = await this.prisma.level.findUnique({
      where: { id },
      include: {
        topic: { select: { name: true, examId: true } },
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { questions: true },
        },
      },
    });

    if (!level) throw new NotFoundException('Nível não encontrado');
    return level;
  }

  async create(createLevelDto: CreateLevelDto) {
    const topicExists = await this.prisma.topic.findUnique({
      where: { id: createLevelDto.topicId },
    });

    if (!topicExists) throw new BadRequestException('Tópico não encontrado');

    const lastLevel = await this.prisma.level.findFirst({
      where: { topicId: createLevelDto.topicId },
      orderBy: { order: 'desc' },
    });

    const newOrder = lastLevel ? lastLevel.order + 1 : 0;

    const baseSlug = generateSlug(createLevelDto.name);
    const slug = await generateUniqueSlug(baseSlug, async (s: string) => {
      const existing = await this.prisma.level.findUnique({
        where: { topicId_slug: { topicId: createLevelDto.topicId, slug: s } },
      });
      return !!existing;
    });

    return this.prisma.level.create({
      data: {
        ...createLevelDto,
        slug,
        order: newOrder,
      },
      include: {
        _count: { select: { questions: true } },
      },
    });
  }

  async update(id: string, updateLevelDto: UpdateLevelDto) {
    const level = await this.prisma.level.findUnique({ where: { id } });
    if (!level) throw new NotFoundException('Nível não encontrado');

    const updateData: any = { ...updateLevelDto };

    if (updateLevelDto.topicId && updateLevelDto.topicId !== level.topicId) {
      const topicExists = await this.prisma.topic.findUnique({
        where: { id: updateLevelDto.topicId },
      });
      if (!topicExists) throw new BadRequestException('Tópico não encontrado');
    }

    const targetTopicId = updateLevelDto.topicId || level.topicId;

    if (updateLevelDto.name || updateLevelDto.topicId) {
      const nameToSlugfy = updateLevelDto.name || level.name;
      const baseSlug = generateSlug(nameToSlugfy);

      const slug = await generateUniqueSlug(baseSlug, async (s: string) => {
        const existing = await this.prisma.level.findFirst({
          where: {
            slug: s,
            topicId: targetTopicId,
            id: { not: id },
          },
        });
        return !!existing;
      });
      updateData.slug = slug;
    }

    try {
      return await this.prisma.level.update({
        where: { id },
        data: updateData,
        include: {
          _count: { select: { questions: true } },
        },
      });
    } catch {
      throw new NotFoundException('Erro ao atualizar nível');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.level.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Nível não encontrado ou erro ao deletar');
    }
  }

  async reorder(reorderDto: ReorderDto) {
    const { ids } = reorderDto;
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.level.update({ where: { id }, data: { order: index } }),
      ),
    );
  }
}
