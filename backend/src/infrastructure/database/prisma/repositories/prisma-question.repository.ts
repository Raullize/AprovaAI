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

  async save(question: Question): Promise<Question> {
    const updated = await this.prisma.$transaction(async (tx) => {
      // Always recreate options for simplicity or we can update them.
      // With the new model, we will just delete and recreate options since they don't have distinct identities in QuestionProps usually.
      await tx.option.deleteMany({ where: { questionId: question.id } });

      const q = await tx.question.update({
        where: { id: question.id },
        data: {
          content: question.content,
          imageUrl: question.imageUrl ?? null,
          type: question.type,
          status: question.status,
          order: question.order,
          explanation: question.explanation ?? null,
          studyLink: question.studyLink ?? null,
          levelId: question.levelId,
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
