import { Exam as PrismaExam } from '@prisma/client';
import { Exam } from '../../../../domain/content/entities/exam.entity';
import { Slug } from '../../../../domain/content/value-objects/slug';

export class PrismaExamMapper {
  static toDomain(raw: PrismaExam & { _count?: { topics: number } }): Exam {
    return Exam.create(
      {
        name: raw.name,
        slug: Slug.create(raw.slug),
        description: raw.description,
        status: raw.status,
        order: raw.order,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        ...(raw._count ? { _count: raw._count } : {}),
      },
      raw.id,
    );
  }

  static toPrisma(exam: Exam): PrismaExam {
    return {
      id: exam.id,
      name: exam.name,
      slug: exam.slug.value,
      description: exam.description ?? null,
      status: exam.status,
      order: exam.order,
      createdAt: exam.createdAt ?? new Date(),
      updatedAt: exam.updatedAt ?? new Date(),
    };
  }
}
