import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const optionSchema = z.object({
  id: z.string().optional(), // Para atualização de alternativas existentes
  text: z.string().min(1, 'Texto da alternativa é obrigatório'),
  isCorrect: z.boolean().default(false),
  order: z.number().int().min(1, 'Ordem deve ser um número positivo'),
});

const updateQuestionSchema = z.object({
  content: z.string().min(1, 'Conteúdo da questão é obrigatório').optional(),
  explanation: z.string().optional(),
  studyLink: z.string().url('Link deve ser uma URL válida').optional().or(z.literal('')),
  order: z.number().int().min(1, 'Ordem deve ser um número positivo').optional(),
  imageUrl: z.string().optional().or(z.literal('')).refine((url) => {
    if (!url || url === '') return true; // URL é opcional ou vazia
    // Aceita URLs relativas (uploads locais) ou URLs completas
    return url.startsWith('/') || url.startsWith('http');
  }, 'URL da imagem inválida'),
  options: z.array(optionSchema).min(2, 'Deve ter pelo menos 2 alternativas').max(6, 'Máximo de 6 alternativas').optional(),
}).refine(
  (data) => !data.options || data.options.some(option => option.isCorrect),
  {
    message: 'Pelo menos uma alternativa deve estar correta',
    path: ['options'],
  }
);

// GET /api/admin/questions/[id] - Buscar questão específica
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

    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        options: {
          orderBy: {
            order: 'asc',
          },
        },
        level: {
          select: {
            id: true,
            name: true,
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
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Questão não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Erro ao buscar questão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/questions/[id] - Atualizar questão
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
    const validatedData = updateQuestionSchema.parse(body);

    // Verificar se a questão existe
    const existingQuestion = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        options: true,
      },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Questão não encontrada' },
        { status: 404 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {
      ...(validatedData.content && { content: validatedData.content }),
      ...(validatedData.explanation !== undefined && { explanation: validatedData.explanation }),
      ...(validatedData.studyLink !== undefined && { studyLink: validatedData.studyLink || null }),
      ...(validatedData.order && { order: validatedData.order }),
      ...(validatedData.imageUrl !== undefined && { imageUrl: validatedData.imageUrl || null }),
    };

    // Se as alternativas foram fornecidas, atualizar
    if (validatedData.options) {
      // Deletar alternativas existentes
      await prisma.option.deleteMany({
        where: { questionId: params.id },
      });

      // Criar novas alternativas
      updateData.options = {
        create: validatedData.options.map(option => ({
          text: option.text,
          isCorrect: option.isCorrect,
          order: option.order,
        })),
      };
    }

    const question = await prisma.question.update({
      where: { id: params.id },
      data: updateData,
      include: {
        options: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erro ao atualizar questão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/questions/[id] - Excluir questão
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

    // Verificar se a questão existe
    const question = await prisma.question.findUnique({
      where: { id: params.id },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Questão não encontrada' },
        { status: 404 }
      );
    }

    await prisma.question.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Questão excluída com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir questão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}