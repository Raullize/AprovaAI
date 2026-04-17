import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ExamRepository } from '../../../../../src/domain/content/repositories/exam.repository';
import { Exam } from '../../../../../src/domain/content/entities/exam.entity';
import { PrismaExamMapper } from '../mappers/prisma-exam.mapper';

@Injectable()
export class PrismaExamRepository implements ExamRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Exam[]> {
    const exams = await this.prisma.exam.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { topics: true },
        },
      },
    });
    return exams.map((exam) => PrismaExamMapper.toDomain(exam));
  }

  async findById(id: string): Promise<Exam | null> {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
    });
    if (!exam) return null;
    return PrismaExamMapper.toDomain(exam);
  }

  async findBySlug(slug: string): Promise<Exam | null> {
    const exam = await this.prisma.exam.findFirst({
      where: {
        slug: {
          equals: slug,
          mode: 'insensitive',
        },
      },
    });
    if (!exam) return null;
    return PrismaExamMapper.toDomain(exam);
  }

  async create(exam: Exam): Promise<Exam> {
    const data = PrismaExamMapper.toPrisma(exam);
    const created = await this.prisma.exam.create({ data });
    return PrismaExamMapper.toDomain(created);
  }

  async update(id: string, data: Partial<Exam>): Promise<Exam> {
    const updateData = { ...data } as Record<string, any>;
    if ('props' in updateData) {
      delete updateData['props'];
    }
    const updated = await this.prisma.exam.update({
      where: { id },
      data: updateData,
    });
    return PrismaExamMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.exam.delete({
      where: { id },
    });
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.exam.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );
  }

  async count(): Promise<number> {
    return this.prisma.exam.count();
  }
}
