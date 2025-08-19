import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { generateSlug, generateUniqueSlug } from '@/lib/slugify';
import { z } from 'zod';

const createExamSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']).default('DRAFT'),
});

const updateExamSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']).optional(),
});

// GET /api/admin/exams - Listar exames
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const exams = await prisma.exam.findMany({
      include: {
        _count: {
          select: {
            topics: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error('Erro ao buscar exames:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/exams - Criar exame
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createExamSchema.parse(body);

    // Gerar slug único
    const baseSlug = generateSlug(validatedData.name);
    const slug = await generateUniqueSlug(
      baseSlug,
      async (slug) => {
        const existing = await prisma.exam.findUnique({ where: { slug } });
        return !!existing;
      }
    );

    const exam = await prisma.exam.create({
      data: {
        ...validatedData,
        slug,
      },
      include: {
        _count: {
          select: {
            topics: true,
          },
        },
      },
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao criar exame:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}