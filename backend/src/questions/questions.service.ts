import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';
import { ReorderDto } from '../exams/dto/exam.dto';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(levelId?: string) {
    return this.prisma.question.findMany({
      where: levelId ? { levelId } : undefined,
      include: {
        level: {
          select: { name: true, topicId: true },
        },
        options: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        level: { select: { name: true, topicId: true } },
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!question) throw new NotFoundException('Questão não encontrada');
    return question;
  }

  async create(createQuestionDto: CreateQuestionDto) {
    const levelExists = await this.prisma.level.findUnique({
      where: { id: createQuestionDto.levelId },
    });

    if (!levelExists) throw new BadRequestException('Nível não encontrado');

    const lastQuestion = await this.prisma.question.findFirst({
      where: { levelId: createQuestionDto.levelId },
      orderBy: { order: 'desc' },
    });

    const newOrder = lastQuestion ? lastQuestion.order + 1 : 0;

    const { options, ...questionData } = createQuestionDto;

    return this.prisma.question.create({
      data: {
        ...questionData,
        order: newOrder,
        options: {
          create: options.map((opt, index) => ({
            ...opt,
            order: index,
          })),
        },
      },
      include: {
        options: true,
      },
    });
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) throw new NotFoundException('Questão não encontrada');

    if (
      updateQuestionDto.levelId &&
      updateQuestionDto.levelId !== question.levelId
    ) {
      const levelExists = await this.prisma.level.findUnique({
        where: { id: updateQuestionDto.levelId },
      });
      if (!levelExists) throw new BadRequestException('Nível não encontrado');
    }

    const { options, ...questionData } = updateQuestionDto;

    try {
      if (options) {
        return await this.prisma.$transaction(
          async (tx: Prisma.TransactionClient) => {
            await tx.question.update({
              where: { id },
              data: questionData,
            });

            await tx.option.deleteMany({
              where: { questionId: id },
            });

            if (options.length > 0) {
              await tx.option.createMany({
                data: options.map((opt, index) => ({
                  text: opt.text || '',
                  isCorrect: opt.isCorrect ?? false,
                  order: index,
                  questionId: id,
                })),
              });
            }

            return tx.question.findUnique({
              where: { id },
              include: { options: { orderBy: { order: 'asc' } } },
            });
          },
        );
      } else {
        return await this.prisma.question.update({
          where: { id },
          data: questionData,
          include: { options: { orderBy: { order: 'asc' } } },
        });
      }
    } catch {
      throw new NotFoundException('Erro ao atualizar questão');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.question.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Questão não encontrada ou erro ao deletar');
    }
  }

  async reorder(reorderDto: ReorderDto) {
    const { ids } = reorderDto;
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.question.update({ where: { id }, data: { order: index } }),
      ),
    );
  }
}
