'use server'

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { generateSlug, generateUniqueSlug } from '@/lib/slugify';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const createTopicSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().optional(),
  examId: z.string().min(1, 'ID do exame é obrigatório'),
});

const updateTopicSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  description: z.string().optional(),
  status: z.nativeEnum({ ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' }).optional(),
});

interface GetTopicsOptions {
  examId: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getTopics({ examId, search = '', page = 1, limit = 10 }: GetTopicsOptions) {
  const session = await getServerSession(authOptions);
    
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    throw new Error('Acesso negado');
  }

  const skip = (page - 1) * limit;

  const where = {
    examId,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [topics, total] = await Promise.all([
    prisma.topic.findMany({
      where,
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
      skip,
      take: limit,
    }),
    prisma.topic.count({ where }),
  ]);

  return {
    topics,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getTopicById(id: string) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        levels: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            levels: true,
          },
        },
      },
    });

    if (!topic) throw new Error('Tópico não encontrado');
    return topic;
}

export async function getTopicBySlug(examSlug: string, topicSlug: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    const topic = await prisma.topic.findFirst({
      where: {
        slug: topicSlug,
        exam: {
          slug: examSlug
        }
      },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        levels: {
          orderBy: {
            order: 'asc'
          },
          include: {
            _count: {
              select: {
                questions: true
              }
            }
          }
        }
      }
    });

    if (!topic) throw new Error('Tópico não encontrado');
    return topic;
}

export async function createTopic(data: z.infer<typeof createTopicSchema>) {
  const session = await getServerSession(authOptions);
    
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    throw new Error('Acesso negado');
  }

  const validatedData = createTopicSchema.parse(data);

  const existingTopic = await prisma.topic.findFirst({
    where: {
      name: validatedData.name,
      examId: validatedData.examId,
    },
  });

  if (existingTopic) {
    throw new Error('Já existe um tópico com este nome neste exame');
  }

  const baseSlug = generateSlug(validatedData.name);
  const slug = await generateUniqueSlug(
    baseSlug,
    async (slug) => {
      const existing = await prisma.topic.findFirst({
        where: {
          slug,
          examId: validatedData.examId
        }
      });
      return !!existing;
    }
  );

  const topic = await prisma.topic.create({
    data: {
      ...validatedData,
      slug,
    },
    include: {
        exam: true,
        _count: {
          select: {
            levels: true,
          },
        },
      },
  });

  revalidatePath(`/admin/exams/${topic.exam.slug}/topics`);
  return topic;
}

export async function updateTopic(data: z.infer<typeof updateTopicSchema>) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    const validatedData = updateTopicSchema.parse(data);
    const { id, ...updateFields } = validatedData;

    const existingTopic = await prisma.topic.findUnique({
        where: { id },
        include: { exam: true }
    });
      
    if (!existingTopic) {
        throw new Error('Tópico não encontrado');
    }

    if (updateFields.name && updateFields.name !== existingTopic.name) {
        const duplicateTopic = await prisma.topic.findFirst({
          where: {
            name: updateFields.name,
            examId: existingTopic.examId,
            id: { not: id },
          },
        });
  
        if (duplicateTopic) {
          throw new Error('Já existe um tópico com este nome neste exame');
        }
    }

    let updateData: any = { ...updateFields };

    if (updateFields.name) {
      const baseSlug = generateSlug(updateFields.name);
      const slug = await generateUniqueSlug(
        baseSlug,
        async (slug) => {
          const existing = await prisma.topic.findFirst({
            where: {
              slug,
              examId: existingTopic.examId,
              id: { not: id }
            }
          });
          return !!existing;
        }
      );
      updateData.slug = slug;
    }

    const topic = await prisma.topic.update({
      where: { id },
      data: updateData,
      include: {
        exam: true,
        _count: {
          select: {
            levels: true,
          },
        },
      },
    });

    revalidatePath(`/admin/exams/${topic.exam.slug}/topics`);
    return topic;
}

export async function deleteTopic(id: string) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    const topic = await prisma.topic.findUnique({
        where: { id },
        include: { 
            exam: true,
            _count: { select: { levels: true } } 
        }
    });

    if (!topic) throw new Error('Tópico não encontrado');

    if (topic._count.levels > 0) {
        throw new Error('Não é possível excluir um tópico que possui níveis. Exclua os níveis primeiro.');
    }

    await prisma.topic.delete({
      where: { id },
    });

    revalidatePath(`/admin/exams/${topic.exam.slug}/topics`);
    return { success: true };
}
