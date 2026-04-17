import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QuestionRepository } from '../../../../../src/domain/content/repositories/question.repository';
import { Question } from '../../../../../src/domain/content/entities/question.entity';
import { PrismaQuestionMapper } from '../mappers/prisma-question.mapper';

@Injectable()
export class PrismaQuestionRepository implements QuestionRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Question[]> {
    const questions = await this.prisma.question.findMany({
      orderBy: { order: 'asc' },
      include: { options: { orderBy: { order: 'asc' } } },
    });
    return questions.map((question) => PrismaQuestionMapper.toDomain(question));
  }

  async findByLevelId(levelId: string): Promise<Question[]> {
    const questions = await this.prisma.question.findMany({
      where: { levelId },
      orderBy: { order: 'asc' },
      include: { options: { orderBy: { order: 'asc' } } },
    });
    return questions.map((question) => PrismaQuestionMapper.toDomain(question));
  }

  async findById(id: string): Promise<Question | null> {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { options: { orderBy: { order: 'asc' } } },
    });
    if (!question) return null;
    return PrismaQuestionMapper.toDomain(question);
  }

  async create(question: Question): Promise<Question> {
    const created = await this.prisma.question.create({
      data: {
        id: question.id,
        content: question.content,
        imageUrl: question.imageUrl ?? null,
        type: question.type,
        status: question.status,
        order: question.order,
        explanation: question.explanation ?? null,
        studyLink: question.studyLink ?? null,
        levelId: question.levelId,
        createdAt: question.createdAt ?? new Date(),
        updatedAt: question.updatedAt ?? new Date(),
        options: {
          create: question.options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect ?? false,
            order: opt.order,
          })),
        },
      },
      include: { options: { orderBy: { order: 'asc' } } },
    });
    return PrismaQuestionMapper.toDomain(created);
  }

  async update(id: string, data: Partial<Question>): Promise<Question> {
    const updateData = { ...data } as Record<string, any>;
    const optionsData = updateData['options'] as
      | { text: string; isCorrect?: boolean; order: number }[]
      | undefined;
    if ('options' in updateData) delete updateData['options'];
    if ('props' in updateData) delete updateData['props'];

    const updated = await this.prisma.$transaction(async (tx) => {
      if (optionsData) {
        await tx.option.deleteMany({ where: { questionId: id } });
      }

      const q = await tx.question.update({
        where: { id },
        data: {
          ...updateData,
          ...(optionsData && {
            options: {
              create: optionsData.map((opt) => ({
                text: opt.text,
                isCorrect: opt.isCorrect ?? false,
                order: opt.order,
              })),
            },
          }),
        },
        include: { options: { orderBy: { order: 'asc' } } },
      });
      return q;
    });

    return PrismaQuestionMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.question.delete({
      where: { id },
    });
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.question.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );
  }

  async countByLevelId(levelId: string): Promise<number> {
    return this.prisma.question.count({
      where: { levelId },
    });
  }
}
