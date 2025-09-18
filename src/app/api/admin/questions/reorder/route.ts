import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reorderQuestionsSchema = z.object({
  levelId: z.string().min(1, 'ID do nível é obrigatório'),
  questionIds: z.array(z.string()).min(1, 'Lista de IDs das questões é obrigatória'),
});

// POST /api/admin/questions/reorder - Reordenar questões
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = reorderQuestionsSchema.parse(body);

    // Verificar se o nível existe
    const level = await prisma.level.findUnique({
      where: { id: validatedData.levelId },
    });

    if (!level) {
      return NextResponse.json(
        { error: 'Nível não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se todas as questões pertencem ao nível
    const questions = await prisma.question.findMany({
      where: {
        id: { in: validatedData.questionIds },
        levelId: validatedData.levelId,
      },
    });

    if (questions.length !== validatedData.questionIds.length) {
      return NextResponse.json(
        { error: 'Uma ou mais questões não pertencem ao nível especificado' },
        { status: 400 }
      );
    }

    // Atualizar a ordem das questões
    const updatePromises = validatedData.questionIds.map((questionId, index) =>
      prisma.question.update({
        where: { id: questionId },
        data: { order: index + 1 },
      })
    );

    await Promise.all(updatePromises);

    // Buscar questões atualizadas
    const updatedQuestions = await prisma.question.findMany({
      where: { levelId: validatedData.levelId },
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
    });

    return NextResponse.json({
      message: 'Ordem das questões atualizada com sucesso',
      questions: updatedQuestions,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao reordenar questões:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
