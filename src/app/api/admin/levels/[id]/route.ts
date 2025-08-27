import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateLevelSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  description: z.string().optional(),
  xpReward: z.number().int().min(0, 'XP deve ser um número positivo').optional(),
  passingPercentage: z.number().min(0).max(100, 'Porcentagem deve estar entre 0 e 100').optional(),
  order: z.number().int().min(1, 'Ordem deve ser um número positivo').optional(),
});

// GET /api/admin/levels/[id] - Buscar nível específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' },
        { status: 403 }
      );
    }

    const level = await prisma.level.findUnique({
      where: { id: params.id },
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

    if (!level) {
      return NextResponse.json(
        { error: 'Nível não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(level);
  } catch (error) {
    console.error('Erro ao buscar nível:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/levels/[id] - Atualizar nível
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateLevelSchema.parse(body);

    // Verificar se o nível existe
    const existingLevel = await prisma.level.findUnique({
      where: { id: params.id },
    });

    if (!existingLevel) {
      return NextResponse.json(
        { error: 'Nível não encontrado' },
        { status: 404 }
      );
    }

    // Se está atualizando o nome, verificar se já existe outro nível com o mesmo nome no mesmo tópico
    if (validatedData.name && validatedData.name !== existingLevel.name) {
      const duplicateLevel = await prisma.level.findFirst({
        where: {
          name: validatedData.name,
          topicId: existingLevel.topicId,
          id: { not: params.id },
        },
      });

      if (duplicateLevel) {
        return NextResponse.json(
          { error: 'Já existe um nível com este nome neste tópico' },
          { status: 400 }
        );
      }
    }

    const level = await prisma.level.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(level);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar nível:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/levels/[id] - Excluir nível
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' },
        { status: 403 }
      );
    }

    // Verificar se o nível existe
    const level = await prisma.level.findUnique({
      where: { id: params.id },
    });

    if (!level) {
      return NextResponse.json(
        { error: 'Nível não encontrado' },
        { status: 404 }
      );
    }

    await prisma.level.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Nível excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir nível:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}