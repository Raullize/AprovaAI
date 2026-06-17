import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ExamResultRepository } from '../../../../domain/simulations/repositories/exam-result.repository';
import { ExamResult, ExamAnswer } from '../../../../domain/simulations/entities/exam-result.entity';
import { PrismaExamResultMapper } from '../mappers/prisma-exam-result.mapper';

@Injectable()
export class PrismaExamResultRepository implements ExamResultRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<ExamResult | null> {
    const result = await this.prisma.examResult.findUnique({
      where: { id },
      include: { answers: true },
    });
    if (!result) return null;
    return PrismaExamResultMapper.toDomain(result);
  }

  async findActiveByUserIdAndLevelId(userId: string, levelId: string): Promise<ExamResult | null> {
    const result = await this.prisma.examResult.findFirst({
      where: { 
        userId, 
        levelId,
        status: 'IN_PROGRESS' 
      },
      include: { answers: true },
    });
    if (!result) return null;
    return PrismaExamResultMapper.toDomain(result);
  }

  async findHistoryByUserId(userId: string): Promise<ExamResult[]> {
    const results = await this.prisma.examResult.findMany({
      where: { 
        userId,
        status: 'COMPLETED'
      },
      include: { 
        answers: true,
        level: {
          include: {
            topic: {
              include: {
                exam: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    // We return it as domain entity, but in a real app you might want to return a DTO
    // with the level/topic/exam names included, or handle that in the controller mapping.
    return results.map(result => PrismaExamResultMapper.toDomain(result));
  }

  async create(examResult: ExamResult): Promise<ExamResult> {
    const data = PrismaExamResultMapper.toPrisma(examResult);
    const created = await this.prisma.examResult.create({ data });
    return PrismaExamResultMapper.toDomain(created);
  }

  async save(examResult: ExamResult): Promise<ExamResult> {
    const data = PrismaExamResultMapper.toPrisma(examResult);
    const updated = await this.prisma.examResult.update({
      where: { id: examResult.id },
      data,
    });
    return PrismaExamResultMapper.toDomain(updated);
  }

  async saveAnswer(answer: ExamAnswer): Promise<ExamAnswer> {
    const data = PrismaExamResultMapper.answerToPrisma(answer);
    
    const saved = await this.prisma.examAnswer.upsert({
      where: {
        examResultId_questionId: {
          examResultId: answer.examResultId,
          questionId: answer.questionId,
        }
      },
      update: {
        selectedOptions: data.selectedOptions,
        isCorrect: data.isCorrect,
        timeSpent: data.timeSpent,
        updatedAt: new Date(),
      },
      create: data,
    });

    return ExamAnswer.create({
      examResultId: saved.examResultId,
      questionId: saved.questionId,
      selectedOptions: saved.selectedOptions,
      isCorrect: saved.isCorrect,
      timeSpent: saved.timeSpent,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    }, saved.id);
  }
}
