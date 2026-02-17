'use server'

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Texto da alternativa é obrigatório'),
  isCorrect: z.boolean().default(false),
  order: z.number().int().min(1, 'Ordem deve ser um número positivo'),
});

const createQuestionSchema = z.object({
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  levelId: z.string().min(1, 'Level ID é obrigatório'),
  type: z.enum(['MULTIPLE_CHOICE', 'SINGLE_CHOICE']).default('SINGLE_CHOICE'),
  imageUrl: z.string().optional().refine((url) => {
    if (!url) return true;
    return url.startsWith('/') || url.startsWith('http');
  }, 'URL da imagem inválida'),
  options: z.array(z.object({
    text: z.string().min(1, 'Texto da opção é obrigatório'),
    isCorrect: z.boolean(),
    order: z.number().int().min(0)
  })).min(2, 'Pelo menos 2 opções são obrigatórias')
});

const updateQuestionSchema = z.object({
  id: z.string(),
  content: z.string().min(1, 'Conteúdo da questão é obrigatório').optional(),
  type: z.enum(['MULTIPLE_CHOICE', 'SINGLE_CHOICE']).optional(),
  explanation: z.string().optional(),
  studyLink: z.string().url('Link deve ser uma URL válida').optional().or(z.literal('')),
  order: z.number().int().min(1, 'Ordem deve ser um número positivo').optional(),
  imageUrl: z.string().optional().or(z.literal('')).refine((url) => {
    if (!url || url === '') return true;
    return url.startsWith('/') || url.startsWith('http');
  }, 'URL da imagem inválida'),
  options: z.array(optionSchema).min(2, 'Deve ter pelo menos 2 alternativas').max(6, 'Máximo de 6 alternativas').optional(),
}).refine(
  (data) => !data.options || data.options.some(option => option.isCorrect),
  {
    message: 'Pelo menos uma alternativa deve estar correta',
    path: ['options'],
  }
);

interface GetQuestionsOptions {
  levelId: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getQuestions({ levelId, search = '', page = 1, limit = 10 }: GetQuestionsOptions) {
  const session = await getServerSession(authOptions);
    
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    throw new Error('Acesso negado');
  }

  const level = await prisma.level.findUnique({
    where: { id: levelId },
  });

  if (!level) throw new Error('Nível não encontrado');

  const skip = (page - 1) * limit;

  const where = {
    levelId,
    ...(search && {
      content: { contains: search, mode: 'insensitive' as const }
    }),
  };

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        options: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
      skip,
      take: limit,
    }),
    prisma.question.count({ where }),
  ]);

  return {
    questions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getQuestionById(id: string) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: {
            order: 'asc',
          },
        },
        level: {
          select: {
            id: true,
            name: true,
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
          },
        },
      },
    });

    if (!question) throw new Error('Questão não encontrada');
    return question;
}

export async function createQuestion(data: z.infer<typeof createQuestionSchema>) {
  const session = await getServerSession(authOptions);
    
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    throw new Error('Acesso negado');
  }

  const validatedData = createQuestionSchema.parse(data);

  const level = await prisma.level.findUnique({
    where: { id: validatedData.levelId },
    include: { topic: { include: { exam: true } } }
  });

  if (!level) throw new Error('Nível não encontrado');

  const maxOrder = await prisma.question.findFirst({
    where: { levelId: validatedData.levelId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  const nextOrder = (maxOrder?.order || 0) + 1;

  const question = await prisma.question.create({
    data: {
      content: validatedData.content,
      levelId: validatedData.levelId,
      type: validatedData.type as any,
      imageUrl: validatedData.imageUrl,
      // @ts-ignore: Prisma types might be outdated
      explanation: validatedData.explanation,
      // @ts-ignore: Prisma types might be outdated
      studyLink: validatedData.studyLink || null,
      order: nextOrder,
      options: {
        create: validatedData.options
      },
    },
    include: {
      options: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  revalidatePath(`/admin/exams/${level.topic.exam.slug}/topics/${level.topic.slug}/levels/${level.slug}/questions`);
  return question;
}

export async function updateQuestion(data: z.infer<typeof updateQuestionSchema>) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    const validatedData = updateQuestionSchema.parse(data);
    const { id } = validatedData;

    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      include: { 
          level: { include: { topic: { include: { exam: true } } } } 
      },
    });

    if (!existingQuestion) throw new Error('Questão não encontrada');

    const updateData: any = {
      ...(validatedData.content && { content: validatedData.content }),
      ...(validatedData.type && { type: validatedData.type }),
      // @ts-ignore: Prisma types might be outdated
      ...(validatedData.explanation !== undefined && { explanation: validatedData.explanation }),
      // @ts-ignore: Prisma types might be outdated
      ...(validatedData.studyLink !== undefined && { studyLink: validatedData.studyLink || null }),
      ...(validatedData.order && { order: validatedData.order }),
      ...(validatedData.imageUrl !== undefined && { imageUrl: validatedData.imageUrl || null }),
    };

    if (validatedData.options) {
      // Transaction para garantir integridade ao substituir opções
      await prisma.$transaction(async (tx) => {
        await tx.option.deleteMany({
            where: { questionId: id },
        });

        updateData.options = {
            create: validatedData.options!.map(option => ({
              text: option.text,
              isCorrect: option.isCorrect,
              order: option.order,
            })),
        };
        
        await tx.question.update({
            where: { id },
            data: updateData,
        });
      });
      
      // Retornar a questão atualizada
      const updatedQuestion = await prisma.question.findUnique({
          where: { id },
          include: {
            options: { orderBy: { order: 'asc' } }
          }
      });
      
      revalidatePath(`/admin/exams/${existingQuestion.level.topic.exam.slug}/topics/${existingQuestion.level.topic.slug}/levels/${existingQuestion.level.slug}/questions`);
      return updatedQuestion;

    } else {
        const question = await prisma.question.update({
            where: { id },
            data: updateData,
            include: {
              options: {
                orderBy: {
                  order: 'asc',
                },
              },
            },
        });
        
        revalidatePath(`/admin/exams/${existingQuestion.level.topic.exam.slug}/topics/${existingQuestion.level.topic.slug}/levels/${existingQuestion.level.slug}/questions`);
        return question;
    }
}

export async function deleteQuestion(id: string) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    const question = await prisma.question.findUnique({
      where: { id },
      include: { level: { include: { topic: { include: { exam: true } } } } }
    });

    if (!question) throw new Error('Questão não encontrada');

    await prisma.question.delete({
      where: { id },
    });

    revalidatePath(`/admin/exams/${question.level.topic.exam.slug}/topics/${question.level.topic.slug}/levels/${question.level.slug}/questions`);
    return { success: true };
}

export async function reorderQuestions(levelId: string, questionIds: string[]) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      throw new Error('Acesso negado');
    }

    await prisma.$transaction(
        questionIds.map((id, index) => 
            prisma.question.update({
                where: { id },
                data: { order: index + 1 }
            })
        )
    );

    const level = await prisma.level.findUnique({
        where: { id: levelId },
        include: { topic: { include: { exam: true } } }
    });
    
    if (level) {
        revalidatePath(`/admin/exams/${level.topic.exam.slug}/topics/${level.topic.slug}/levels/${level.slug}/questions`);
    }

    return { success: true };
}
