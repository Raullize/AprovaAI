import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { generateSlug, generateUniqueSlug } from '@/lib/slugify';
import { z } from 'zod';

const updateTopicSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  description: z.string().optional(),
  status: z.nativeEnum({ ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' }).optional(),
});

// GET /api/admin/topics/[id] - Buscar tópico específico
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

    const topic = await prisma.topic.findUnique({
      where: { id: params.id },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
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

    if (!topic) {
      return NextResponse.json(
        { error: 'Tópico não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Erro ao buscar tópico:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/topics/[id] - Atualizar tópico
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
    const validatedData = updateTopicSchema.parse(body);

    // Verificar se o tópico existe
    const existingTopic = await prisma.topic.findUnique({
      where: { id: params.id },
    });

    if (!existingTopic) {
      return NextResponse.json(
        { error: 'Tópico não encontrado' },
        { status: 404 }
      );
    }

    // Se está atualizando o nome, verificar se já existe outro tópico com o mesmo nome no mesmo exame
    if (validatedData.name && validatedData.name !== existingTopic.name) {
      const duplicateTopic = await prisma.topic.findFirst({
        where: {
          name: validatedData.name,
          examId: existingTopic.examId,
          id: { not: params.id },
        },
      });

      if (duplicateTopic) {
        return NextResponse.json(
          { error: 'Já existe um tópico com este nome neste exame' },
          { status: 400 }
        );
      }
    }

    let updateData = { ...validatedData };

    // Se o nome foi alterado, gerar novo slug
    if (validatedData.name) {
      const baseSlug = generateSlug(validatedData.name);
      const slug = await generateUniqueSlug(
        baseSlug,
        async (slug) => {
          const existing = await prisma.topic.findFirst({
            where: {
              slug,
              examId: existingTopic.examId,
              id: { not: params.id }
            }
          });
          return !!existing;
        }
      );
      updateData.slug = slug;
    }

    const topic = await prisma.topic.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: {
            levels: true,
          },
        },
      },
    });

    return NextResponse.json(topic);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar tópico:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/topics/[id] - Excluir tópico
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

    // Verificar se o tópico existe
    const topic = await prisma.topic.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            levels: true,
          },
        },
      },
    });

    if (!topic) {
      return NextResponse.json(
        { error: 'Tópico não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o tópico tem níveis associados
    if (topic._count.levels > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir um tópico que possui níveis. Exclua os níveis primeiro.' },
        { status: 400 }
      );
    }

    await prisma.topic.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Tópico excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir tópico:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}