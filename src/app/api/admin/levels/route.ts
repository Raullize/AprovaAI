import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { generateSlug, generateUniqueSlug } from '@/lib/slugify';
import { z } from 'zod';

const createLevelSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().optional(),
  topicId: z.string().min(1, 'ID do tópico é obrigatório'),
  xpReward: z.number().int().min(0, 'XP deve ser um número positivo').default(0),
  passingPercentage: z.number().min(0).max(100, 'Porcentagem deve estar entre 0 e 100').default(70),
});

// GET /api/admin/levels - Listar níveis por tópico
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
    const topicId = searchParams.get('topicId');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!topicId) {
      return NextResponse.json(
        { error: 'ID do tópico é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o tópico existe
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return NextResponse.json(
        { error: 'Tópico não encontrado' },
        { status: 404 }
      );
    }

    const where = {
      topicId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [levels, total] = await Promise.all([
      prisma.level.findMany({
        where,
        orderBy: [
          { order: 'asc' }, // Ordenação manual
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
        },
      }),
      prisma.level.count({ where }),
    ]);

    return NextResponse.json({
      levels,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar níveis:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/levels - Criar novo nível
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
    const validatedData = createLevelSchema.parse(body);

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

    // Verificar se já existe um nível com o mesmo nome no tópico
    const existingLevel = await prisma.level.findFirst({
      where: {
        name: validatedData.name,
        topicId: validatedData.topicId,
      },
    });

    if (existingLevel) {
      return NextResponse.json(
        { error: 'Já existe um nível com este nome neste tópico' },
        { status: 400 }
      );
    }

    // Gerar slug único para o nível dentro do tópico
    const baseSlug = generateSlug(validatedData.name);
    const slug = await generateUniqueSlug(
      baseSlug,
      async (slug) => {
        const existing = await prisma.level.findFirst({
          where: {
            slug,
            topicId: validatedData.topicId
          }
        });
        return !!existing;
      }
    );

    // Obter o próximo número de ordem
    const maxOrder = await prisma.level.findFirst({
      where: { topicId: validatedData.topicId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = (maxOrder?.order || 0) + 1;

    const level = await prisma.level.create({
      data: {
        ...validatedData,
        slug,
        order: nextOrder,
      },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    return NextResponse.json(level, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao criar nível:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
