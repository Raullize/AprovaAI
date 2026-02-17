'use server'

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSlug, generateUniqueSlug } from '@/lib/slugify';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const createExamSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

const updateExamSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export async function getExams() {
  const session = await getServerSession(authOptions);
    
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    throw new Error('Acesso negado');
  }

  return await prisma.exam.findMany({
    include: {
      _count: {
        select: {
          topics: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getExamById(id: string) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        topics: {
          include: {
            _count: {
              select: {
                levels: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            topics: true,
          },
        },
      },
    });

    if (!exam) throw new Error('Exame não encontrado');
    return exam;
}

export async function getExamBySlug(slug: string) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    const exam = await prisma.exam.findUnique({
      where: { slug },
      include: {
        topics: {
          include: {
            _count: {
              select: {
                levels: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            topics: true,
          },
        },
      },
    });

    if (!exam) throw new Error('Exame não encontrado');
    return exam;
}

export async function createExam(data: z.infer<typeof createExamSchema>) {
  const session = await getServerSession(authOptions);
    
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    throw new Error('Acesso negado');
  }

  const validatedData = createExamSchema.parse(data);

  const baseSlug = generateSlug(validatedData.name);
  const slug = await generateUniqueSlug(
    baseSlug,
    async (slug) => {
      const existing = await prisma.exam.findUnique({ where: { slug } });
      return !!existing;
    }
  );

  const exam = await prisma.exam.create({
    data: {
      ...validatedData,
      slug,
    },
    include: {
      _count: {
        select: {
          topics: true,
        },
      },
    },
  });

  revalidatePath('/admin/exams');
  return exam;
}

export async function updateExam(data: z.infer<typeof updateExamSchema>) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    const validatedData = updateExamSchema.parse(data);
    const { id, ...updateFields } = validatedData;

    let updateData: any = { ...updateFields };

    if (updateFields.name) {
      const baseSlug = generateSlug(updateFields.name);
      const slug = await generateUniqueSlug(
        baseSlug,
        async (slug) => {
          const existing = await prisma.exam.findFirst({
            where: {
              slug,
              id: { not: id }
            }
          });
          return !!existing;
        }
      );
      updateData.slug = slug;
    }

    const exam = await prisma.exam.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            topics: true,
          },
        },
      },
    });

    revalidatePath('/admin/exams');
    // Se estivéssemos numa página de detalhe do exame que usa slug, precisaríamos revalidar ela também
    // revalidatePath(`/admin/exams/${exam.slug}`); 
    return exam;
}

export async function deleteExam(id: string) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    await prisma.exam.delete({
      where: { id },
    });

    revalidatePath('/admin/exams');
    return { success: true };
}
