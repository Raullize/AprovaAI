'use server'

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const validateSimulationSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOptions: z.array(z.string())
  })),
  timeSpent: z.number().optional()
});

export async function submitSimulation(levelId: string, data: z.infer<typeof validateSimulationSchema>) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error('Não autorizado');
    }

    const validationResult = validateSimulationSchema.safeParse(data);
    if (!validationResult.success) {
      throw new Error('Dados inválidos');
    }

    const { answers, timeSpent } = validationResult.data;

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
      throw new Error('Nível não encontrado');
    }

    const questionIds = level.questions.map(q => q.id);
    const answeredQuestionIds = answers.map(a => a.questionId);
    
    const missingQuestions = questionIds.filter(id => !answeredQuestionIds.includes(id));
    if (missingQuestions.length > 0) {
      throw new Error('Todas as questões devem ser respondidas');
    }

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
      
      let isCorrect = false;

      if ((question as any).type === 'SINGLE_CHOICE') {
         isCorrect = selectedOptions.length === 1 && correctOptions.includes(selectedOptions[0]);
      } else {
        isCorrect = 
          correctOptions.length === selectedOptions.length &&
          correctOptions.every(id => selectedOptions.includes(id));
      }

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

    const examResult = await prisma.examResult.create({
      data: {
        userId: session.user.id,
        levelId: levelId,
        score: correctAnswers,
        totalQuestions,
        percentage: Math.round(percentage * 100) / 100,
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

    return {
      resultId: examResult.id,
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
    };
}

export async function getSimulationResult(levelId: string, resultId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error('Não autorizado');
    }

    const result = await prisma.examResult.findFirst({
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
      throw new Error('Resultado não encontrado');
    }

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

    return {
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
    };
}
