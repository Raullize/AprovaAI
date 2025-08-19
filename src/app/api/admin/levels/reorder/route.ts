import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reorderLevelsSchema = z.object({
  topicId: z.string().min(1, 'ID do tópico é obrigatório'),
  levelIds: z.array(z.string()).min(1, 'Lista de IDs dos níveis é obrigatória'),
});

// POST /api/admin/levels/reorder - Reordenar níveis
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = reorderLevelsSchema.parse(body);

    // Verificar se o tópico existe
    const topic = await prisma.topic.findUnique({
      where: { id: validatedData.topicId },
    });

    if (!topic) {
      return NextResponse.json(
        { error: 'Tópico não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se todos os níveis pertencem ao tópico
    const levels = await prisma.level.findMany({
      where: {
        id: { in: validatedData.levelIds },
        topicId: validatedData.topicId,
      },
    });

    if (levels.length !== validatedData.levelIds.length) {
      return NextResponse.json(
        { error: 'Um ou mais níveis não pertencem ao tópico especificado' },
        { status: 400 }
      );
    }

    // Atualizar a ordem dos níveis
    const updatePromises = validatedData.levelIds.map((levelId, index) =>
      prisma.level.update({
        where: { id: levelId },
        data: { order: index + 1 },
      })
    );

    await Promise.all(updatePromises);

    // Buscar níveis atualizados
    const updatedLevels = await prisma.level.findMany({
      where: { topicId: validatedData.topicId },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json({
      message: 'Ordem dos níveis atualizada com sucesso',
      levels: updatedLevels,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao reordenar níveis:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}