import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { generateSlug, generateUniqueSlug } from '@/lib/slugify';
import { z } from 'zod';

const updateExamSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']).optional(),
});

// GET /api/admin/exams/[id] - Buscar exame específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' },
        { status: 403 }
      );
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
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

    if (!exam) {
      return NextResponse.json(
        { error: 'Exame não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error('Erro ao buscar exame:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/exams/[id] - Atualizar exame
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateExamSchema.parse(body);

    let updateData = { ...validatedData };

    // Se o nome foi alterado, gerar novo slug
    if (validatedData.name) {
      const baseSlug = generateSlug(validatedData.name);
      const slug = await generateUniqueSlug(
        baseSlug,
        async (slug) => {
          const existing = await prisma.exam.findFirst({
            where: {
              slug,
              id: { not: params.id }
            }
          });
          return !!existing;
        }
      );
      updateData.slug = slug;
    }

    const exam = await prisma.exam.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(exam);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar exame:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/exams/[id] - Excluir exame
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' },
        { status: 403 }
      );
    }

    await prisma.exam.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Exame excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir exame:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}