import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const validateSimuladoSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOptions: z.array(z.string())
  })),
  timeSpent: z.number().optional() // tempo gasto em segundos
});

export async function POST(request: NextRequest, { params }: { params: { levelId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { levelId } = params;
    const body = await request.json();
    
    // Validar dados de entrada
    const validationResult = validateSimuladoSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { answers, timeSpent } = validationResult.data;

    // Buscar o nível com suas questões e alternativas
    const level = await prisma.level.findUnique({
      where: { id: levelId },
      include: {
        questions: {
          include: {
            options: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!level) {
      return NextResponse.json({ error: 'Nível não encontrado' }, { status: 404 });
    }

    // Validar se todas as questões foram respondidas
    const questionIds = level.questions.map(q => q.id);
    const answeredQuestionIds = answers.map(a => a.questionId);
    
    const missingQuestions = questionIds.filter(id => !answeredQuestionIds.includes(id));
    if (missingQuestions.length > 0) {
      return NextResponse.json(
        { error: 'Todas as questões devem ser respondidas' },
        { status: 400 }
      );
    }

    // Calcular pontuação
    let correctAnswers = 0;
    const questionResults = [];

    for (const question of level.questions) {
      const userAnswer = answers.find(a => a.questionId === question.id);
      if (!userAnswer) continue;

      const correctOptions = question.options
        ?.filter(opt => opt.isCorrect)
        ?.map(opt => opt.id)
        ?.sort() || [];
      
      const selectedOptions = userAnswer.selectedOptions.sort();
      
      // Verificar se a resposta está correta (todas as opções corretas selecionadas e nenhuma incorreta)
      const isCorrect = 
        correctOptions.length === selectedOptions.length &&
        correctOptions.every(id => selectedOptions.includes(id));

      if (isCorrect) {
        correctAnswers++;
      }

      questionResults.push({
        questionId: question.id,
        questionContent: question.content,
        isCorrect,
        correctOptions,
        selectedOptions,
        explanation: question.explanation,
        studyLink: question.studyLink
      });
    }

    const totalQuestions = level.questions.length;
    const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const passed = percentage >= level.passingPercentage;

    // Salvar resultado do simulado
    const simuladoResult = await prisma.simuladoResult.create({
      data: {
        userId: session.user.id,
        levelId: levelId,
        score: correctAnswers,
        totalQuestions,
        percentage: Math.round(percentage * 100) / 100, // 2 casas decimais
        passed,
        timeSpent: timeSpent || null,
        answers: {
          create: answers.map(answer => ({
            questionId: answer.questionId,
            selectedOptions: answer.selectedOptions
          }))
        }
      },
      include: {
        answers: true
      }
    });

    // Se passou, adicionar XP ao usuário
    if (passed) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: {
            increment: level.xpReward
          }
        }
      });
    }

    return NextResponse.json({
      resultId: simuladoResult.id,
      score: correctAnswers,
      totalQuestions,
      percentage: Math.round(percentage * 100) / 100,
      passed,
      passingPercentage: level.passingPercentage,
      xpEarned: passed ? level.xpReward : 0,
      timeSpent,
      questions: questionResults,
      level: {
        id: level.id,
        name: level.name,
        simuladoName: level.name,
        simuladoDescription: level.description
      }
    });

  } catch (error) {
    console.error('Erro ao validar simulado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Buscar resultado de um simulado específico
export async function GET(request: NextRequest, { params }: { params: { levelId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { levelId } = params;
    const { searchParams } = new URL(request.url);
    const resultId = searchParams.get('resultId');

    if (!resultId) {
      return NextResponse.json({ error: 'ID do resultado é obrigatório' }, { status: 400 });
    }

    const result = await prisma.simuladoResult.findFirst({
      where: {
        id: resultId,
        userId: session.user.id,
        levelId
      },
      include: {
        answers: true,
        level: {
          include: {
            questions: {
              include: {
                options: true
              },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!result) {
      return NextResponse.json({ error: 'Resultado não encontrado' }, { status: 404 });
    }

    // Montar detalhes das questões com as respostas do usuário
    const questionDetails = result.level.questions.map(question => {
      const userAnswer = result.answers.find(a => a.questionId === question.id);
      const correctOptions = question.options?.filter(opt => opt.isCorrect)?.map(opt => opt.id) || [];
      
      return {
          id: question.id,
          content: question.content,
          explanation: question.explanation,
          studyLink: question.studyLink,
        options: question.options?.map(opt => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          wasSelected: userAnswer?.selectedOptions.includes(opt.id) || false
        })) || [],
        userSelectedOptions: userAnswer?.selectedOptions || [],
        correctOptions,
        isCorrect: userAnswer ? 
          correctOptions.length === userAnswer.selectedOptions.length &&
          correctOptions.every(id => userAnswer.selectedOptions.includes(id)) : false
      };
    });

    return NextResponse.json({
      id: result.id,
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      passed: result.passed,
      passingPercentage: result.level.passingPercentage,
      xpEarned: result.passed ? result.level.xpReward : 0,
      timeSpent: result.timeSpent,
      completedAt: result.createdAt,
      level: {
        id: result.level.id,
        name: result.level.name,
        simuladoName: result.level.name,
        simuladoDescription: result.level.description
      },
      questions: questionDetails
    });

  } catch (error) {
    console.error('Erro ao buscar resultado do simulado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}