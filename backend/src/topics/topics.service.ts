import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto, UpdateTopicDto } from './dto/topic.dto';
import { ReorderDto } from '../exams/dto/exam.dto';
import { generateSlug, generateUniqueSlug } from '../utils/slugify';

@Injectable()
export class TopicsService {
    constructor(private prisma: PrismaService) { }

    async findAll(examId?: string) {
        return this.prisma.topic.findMany({
            where: examId ? { examId } : undefined,
            include: {
                exam: {
                    select: { name: true },
                },
                _count: {
                    select: { levels: true },
                },
            },
            orderBy: { order: 'asc' },
        });
    }

    async findOne(id: string) {
        const topic = await this.prisma.topic.findUnique({
            where: { id },
            include: {
                exam: { select: { name: true } },
                levels: {
                    include: {
                        _count: { select: { questions: true } },
                    },
                    orderBy: { order: 'asc' },
                },
                _count: {
                    select: { levels: true },
                },
            },
        });

        if (!topic) {
            throw new NotFoundException('Tópico não encontrado');
        }

        return topic;
    }

    async create(createTopicDto: CreateTopicDto) {
        const examExists = await this.prisma.exam.findUnique({
            where: { id: createTopicDto.examId },
        });

        if (!examExists) {
            throw new BadRequestException('Exame não encontrado');
        }

        const baseSlug = generateSlug(createTopicDto.name);
        const slug = await generateUniqueSlug(baseSlug, async (s: string) => {
            const existing = await this.prisma.topic.findUnique({
                where: { examId_slug: { examId: createTopicDto.examId, slug: s } },
            });
            return !!existing;
        });

        return this.prisma.topic.create({
            data: {
                ...createTopicDto,
                slug,
            },
            include: {
                _count: { select: { levels: true } },
            },
        });
    }

    async update(id: string, updateTopicDto: UpdateTopicDto) {
        const topic = await this.prisma.topic.findUnique({ where: { id } });
        if (!topic) throw new NotFoundException('Tópico não encontrado');

        let updateData: any = { ...updateTopicDto };

        if (updateTopicDto.examId && updateTopicDto.examId !== topic.examId) {
            const examExists = await this.prisma.exam.findUnique({
                where: { id: updateTopicDto.examId },
            });
            if (!examExists) {
                throw new BadRequestException('Exame não encontrado');
            }
        }

        const targetExamId = updateTopicDto.examId || topic.examId;

        if (updateTopicDto.name || updateTopicDto.examId) {
            const nameToSlugfy = updateTopicDto.name || topic.name;
            const baseSlug = generateSlug(nameToSlugfy);

            const slug = await generateUniqueSlug(baseSlug, async (s: string) => {
                const existing = await this.prisma.topic.findFirst({
                    where: {
                        slug: s,
                        examId: targetExamId,
                        id: { not: id },
                    },
                });
                return !!existing;
            });
            updateData.slug = slug;
        }

        try {
            return await this.prisma.topic.update({
                where: { id },
                data: updateData,
                include: {
                    _count: { select: { levels: true } },
                },
            });
        } catch {
            throw new NotFoundException('Erro ao atualizar tópico');
        }
    }

    async remove(id: string) {
        try {
            await this.prisma.topic.delete({ where: { id } });
        } catch {
            throw new NotFoundException('Tópico não encontrado ou erro ao deletar');
        }
    }

    async reorder(reorderDto: ReorderDto) {
        const { ids } = reorderDto;
        await this.prisma.$transaction(
            ids.map((id, index) =>
                this.prisma.topic.update({ where: { id }, data: { order: index } })
            )
        );
    }
}
