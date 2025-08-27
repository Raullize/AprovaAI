import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/admin/exams/slug/[slug] - Buscar exame específico por slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' },
        { status: 403 }
      );
    }

    const exam = await prisma.exam.findUnique({
      where: { slug: params.slug },
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
    console.error('Erro ao buscar exame por slug:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}