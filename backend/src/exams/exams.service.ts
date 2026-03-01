import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto, UpdateExamDto, ReorderDto } from './dto/exam.dto';
import { generateSlug, generateUniqueSlug } from '../utils/slugify';

@Injectable()
export class ExamsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.exam.findMany({
            include: {
                _count: {
                    select: { topics: true },
                },
            },
            orderBy: { order: 'asc' },
        });
    }

    async findOne(id: string) {
        const exam = await this.prisma.exam.findUnique({
            where: { id },
            include: {
                topics: {
                    include: {
                        _count: { select: { levels: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: { topics: true },
                },
            },
        });

        if (!exam) {
            throw new NotFoundException('Exame não encontrado');
        }

        return exam;
    }

    async create(createExamDto: CreateExamDto) {
        const baseSlug = generateSlug(createExamDto.name);
        const slug = await generateUniqueSlug(baseSlug, async (s: string) => {
            const existing = await this.prisma.exam.findUnique({ where: { slug: s } });
            return !!existing;
        });

        return this.prisma.exam.create({
            data: {
                ...createExamDto,
                slug,
            },
            include: {
                _count: { select: { topics: true } },
            },
        });
    }

    async update(id: string, updateExamDto: UpdateExamDto) {
        let updateData: any = { ...updateExamDto };

        if (updateExamDto.name) {
            const baseSlug = generateSlug(updateExamDto.name);
            const slug = await generateUniqueSlug(baseSlug, async (s: string) => {
                const existing = await this.prisma.exam.findFirst({
                    where: { slug: s, id: { not: id } },
                });
                return !!existing;
            });
            updateData.slug = slug;
        }

        // Prisma update throws if not found technically, but let's just let it bubble up
        // or handle carefully.
        try {
            return await this.prisma.exam.update({
                where: { id },
                data: updateData,
            });
        } catch {
            throw new NotFoundException('Exame não encontrado ou erro ao atualizar');
        }
    }

    async remove(id: string) {
        try {
            await this.prisma.exam.delete({ where: { id } });
        } catch {
            throw new NotFoundException('Exame não encontrado ou erro ao deletar');
        }
    }

    async reorder(reorderDto: ReorderDto) {
        const { ids } = reorderDto;
        await this.prisma.$transaction(
            ids.map((id, index) =>
                this.prisma.exam.update({ where: { id }, data: { order: index } })
            )
        );
    }
}
