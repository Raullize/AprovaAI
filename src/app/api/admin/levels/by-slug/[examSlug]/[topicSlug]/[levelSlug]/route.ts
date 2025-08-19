import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { examSlug: string; topicSlug: string; levelSlug: string } }
) {
  try {
    const { examSlug, topicSlug, levelSlug } = params;

    // Buscar o nível pelo slug do exame, tópico e nível
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
            exam: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
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

    if (!level) {
      return NextResponse.json(
        { error: 'Nível não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(level);
  } catch (error) {
    console.error('Erro ao buscar nível por slug:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}