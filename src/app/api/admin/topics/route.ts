import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { generateSlug, generateUniqueSlug } from '@/lib/slugify';
import { z } from 'zod';

const createTopicSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().optional(),
  examId: z.string().min(1, 'ID do exame é obrigatório'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!examId) {
      return NextResponse.json(
        { error: 'ID do exame é obrigatório' },
        { status: 400 }
      );
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json(
        { error: 'Exame não encontrado' },
        { status: 404 }
      );
    }

    const where = {
      examId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [topics, total] = await Promise.all([
      prisma.topic.findMany({
        where,
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
        skip,
        take: limit,
      }),
      prisma.topic.count({ where }),
    ]);

    return NextResponse.json({
      topics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar tópicos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

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
    const validatedData = createTopicSchema.parse(body);

    const exam = await prisma.exam.findUnique({
      where: { id: validatedData.examId },
    });

    if (!exam) {
      return NextResponse.json(
        { error: 'Exame não encontrado' },
        { status: 404 }
      );
    }

    const existingTopic = await prisma.topic.findFirst({
      where: {
        name: validatedData.name,
        examId: validatedData.examId,
      },
    });

    if (existingTopic) {
      return NextResponse.json(
        { error: 'Já existe um tópico com este nome neste exame' },
        { status: 400 }
      );
    }

    const baseSlug = generateSlug(validatedData.name);
    const slug = await generateUniqueSlug(
      baseSlug,
      async (slug) => {
        const existing = await prisma.topic.findFirst({
          where: {
            slug,
            examId: validatedData.examId
          }
        });
        return !!existing;
      }
    );

    const topic = await prisma.topic.create({
      data: {
        ...validatedData,
        slug,
      },
      include: {
        _count: {
          select: {
            levels: true,
          },
        },
      },
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao criar tópico:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}