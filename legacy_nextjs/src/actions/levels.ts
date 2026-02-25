'use server'

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSlug, generateUniqueSlug } from '@/lib/slugify';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const createLevelSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().optional(),
  topicId: z.string().min(1, 'ID do tópico é obrigatório'),
  xpReward: z.number().int().min(0, 'XP deve ser um número positivo').default(0),
  passingPercentage: z.number().min(0).max(100, 'Porcentagem deve estar entre 0 e 100').default(70),
});

const updateLevelSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  description: z.string().optional(),
  xpReward: z.number().int().min(0, 'XP deve ser um número positivo').optional(),
  passingPercentage: z.number().min(0).max(100, 'Porcentagem deve estar entre 0 e 100').optional(),
  order: z.number().int().min(1, 'Ordem deve ser um número positivo').optional(),
});

interface GetLevelsOptions {
  topicId: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getLevels({ topicId, search = '', page = 1, limit = 10 }: GetLevelsOptions) {
  const session = await getServerSession(authOptions);
    
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    throw new Error('Acesso negado');
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
  });

  if (!topic) throw new Error('Tópico não encontrado');

  const skip = (page - 1) * limit;

  const where = {
    topicId,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [levels, total] = await Promise.all([
    prisma.level.findMany({
      where,
      orderBy: [
        { order: 'asc' }, 
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    }),
    prisma.level.count({ where }),
  ]);

  return {
    levels,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getLevelById(id: string) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    const level = await prisma.level.findUnique({
      where: { id },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            exam: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    if (!level) throw new Error('Nível não encontrado');
    return level;
}

export async function getLevelBySlug(examSlug: string, topicSlug: string, levelSlug: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    const level = await prisma.level.findFirst({
      where: {
        slug: levelSlug,
        topic: {
          slug: topicSlug,
          exam: {
            slug: examSlug
          }
        }
      },
      include: {
        topic: {
          include: {
            exam: true
          }
        },
        questions: {
          include: {
            options: {
              orderBy: {
                order: 'asc'
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!level) throw new Error('Nível não encontrado');
    return level;
}

export async function createLevel(data: z.infer<typeof createLevelSchema>) {
  const session = await getServerSession(authOptions);
    
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    throw new Error('Acesso negado');
  }

  const validatedData = createLevelSchema.parse(data);

  const topic = await prisma.topic.findUnique({
    where: { id: validatedData.topicId },
    include: { exam: true }
  });

  if (!topic) throw new Error('Tópico não encontrado');

  const existingLevel = await prisma.level.findFirst({
    where: {
      name: validatedData.name,
      topicId: validatedData.topicId,
    },
  });

  if (existingLevel) throw new Error('Já existe um nível com este nome neste tópico');

  const baseSlug = generateSlug(validatedData.name);
  const slug = await generateUniqueSlug(
    baseSlug,
    async (slug) => {
      const existing = await prisma.level.findFirst({
        where: {
          slug,
          topicId: validatedData.topicId
        }
      });
      return !!existing;
    }
  );

  const maxOrder = await prisma.level.findFirst({
    where: { topicId: validatedData.topicId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  const nextOrder = (maxOrder?.order || 0) + 1;

  const level = await prisma.level.create({
    data: {
      ...validatedData,
      slug,
      order: nextOrder,
    },
    include: {
        topic: { include: { exam: true } },
        _count: {
          select: {
            questions: true,
          },
        },
      },
  });

  revalidatePath(`/admin/exams/${topic.exam.slug}/topics/${topic.slug}/levels`);
  return level;
}

export async function updateLevel(data: z.infer<typeof updateLevelSchema>) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    const validatedData = updateLevelSchema.parse(data);
    const { id, ...updateFields } = validatedData;

    const existingLevel = await prisma.level.findUnique({
        where: { id },
        include: { topic: { include: { exam: true } } }
    });

    if (!existingLevel) throw new Error('Nível não encontrado');

    if (updateFields.name && updateFields.name !== existingLevel.name) {
      const duplicateLevel = await prisma.level.findFirst({
        where: {
          name: updateFields.name,
          topicId: existingLevel.topicId,
          id: { not: id },
        },
      });

      if (duplicateLevel) throw new Error('Já existe um nível com este nome neste tópico');
    }

    let updateData: any = { ...updateFields };
    
    if (updateFields.name) {
        const baseSlug = generateSlug(updateFields.name);
        const slug = await generateUniqueSlug(
            baseSlug,
            async (slug) => {
            const existing = await prisma.level.findFirst({
                where: {
                slug,
                topicId: existingLevel.topicId,
                id: { not: id }
                }
            });
            return !!existing;
            }
        );
        updateData.slug = slug;
    }

    const level = await prisma.level.update({
      where: { id },
      data: updateData,
    });

    revalidatePath(`/admin/exams/${existingLevel.topic.exam.slug}/topics/${existingLevel.topic.slug}/levels`);
    return level;
}

export async function deleteLevel(id: string) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    const level = await prisma.level.findUnique({
        where: { id },
        include: { topic: { include: { exam: true } } }
    });

    if (!level) throw new Error('Nível não encontrado');

    await prisma.level.delete({
      where: { id },
    });

    revalidatePath(`/admin/exams/${level.topic.exam.slug}/topics/${level.topic.slug}/levels`);
    return { success: true };
}

export async function reorderLevels(topicId: string, levelIds: string[]) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    // Usar transaction para garantir consistência
    await prisma.$transaction(
        levelIds.map((id, index) => 
            prisma.level.update({
                where: { id },
                data: { order: index + 1 }
            })
        )
    );

    const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        include: { exam: true }
    });
    
    if (topic) {
        revalidatePath(`/admin/exams/${topic.exam.slug}/topics/${topic.slug}/levels`);
    }

    return { success: true };
}
