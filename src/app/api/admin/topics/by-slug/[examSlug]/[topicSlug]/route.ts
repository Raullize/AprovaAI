import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { examSlug: string; topicSlug: string } }
) {
  try {
    const { examSlug, topicSlug } = params;

    // Buscar o tópico pelo slug do exame e slug do tópico
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

    if (!topic) {
      return NextResponse.json(
        { error: 'Tópico não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Erro ao buscar tópico por slug:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}