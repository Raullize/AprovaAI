import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const optionSchema = z.object({
  text: z.string().min(1, 'Texto da alternativa é obrigatório'),
  isCorrect: z.boolean().default(false),
  order: z.number().int().min(1, 'Ordem deve ser um número positivo'),
});

const createQuestionSchema = z.object({
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  levelId: z.string().min(1, 'Level ID é obrigatório'),
  imageUrl: z.string().optional().refine((url) => {
    if (!url) return true; // URL é opcional
    // Aceita URLs relativas (uploads locais) ou URLs completas
    return url.startsWith('/') || url.startsWith('http');
  }, 'URL da imagem inválida'),
  options: z.array(z.object({
    text: z.string().min(1, 'Texto da opção é obrigatório'),
    isCorrect: z.boolean(),
    order: z.number().int().min(0)
  })).min(2, 'Pelo menos 2 opções são obrigatórias')
})

// GET /api/admin/questions - Listar questões por nível
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const levelId = searchParams.get('levelId');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!levelId) {
      return NextResponse.json(
        { error: 'ID do nível é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o nível existe
    const level = await prisma.level.findUnique({
      where: { id: levelId },
    });

    if (!level) {
      return NextResponse.json(
        { error: 'Nível não encontrado' },
        { status: 404 }
      );
    }

    const where = {
      levelId,
      ...(search && {
        content: { contains: search, mode: 'insensitive' as const }
      }),
    };

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
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
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/questions - Criar nova questão
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
    const validatedData = createQuestionSchema.parse(body);

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

    // Obter o próximo número de ordem
    const maxOrder = await prisma.question.findFirst({
      where: { levelId: validatedData.levelId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = (maxOrder?.order || 0) + 1;

    // Criar questão com alternativas
    const question = await prisma.question.create({
      data: {
        content: validatedData.content,
        levelId: validatedData.levelId,
        imageUrl: validatedData.imageUrl,
        order: nextOrder,
        options: {
          create: validatedData.options
        },
      },
      include: {
        options: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao criar questão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}