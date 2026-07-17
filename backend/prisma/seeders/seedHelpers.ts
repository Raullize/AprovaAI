import { createHash } from 'node:crypto';
import { PrismaClient, QuestionType, QuestionStatus } from '@prisma/client';

export interface QuestionSeed {
  id: string;
  content: string;
  explanation: string;
  type?: QuestionType;
  options: { id: string; text: string; isCorrect: boolean; order: number }[];
}

export function buildSeedUuid(seed: string): string {
  const hash = createHash('sha256').update(seed).digest('hex');
  const version = `5${hash.slice(13, 16)}`;
  const variantNibble = ((parseInt(hash[16], 16) & 0x3) | 0x8).toString(16);
  const variant = `${variantNibble}${hash.slice(17, 20)}`;

  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    version,
    variant,
    hash.slice(20, 32),
  ].join('-');
}

export async function upsertQuestions(
  prisma: PrismaClient,
  questions: QuestionSeed[],
  simulationId: string,
) {
  for (const [i, q] of questions.entries()) {
    const questionId = buildSeedUuid(`question:${simulationId}:${i + 1}:${q.id}`);
    const question = await prisma.question.upsert({
      where: { id: questionId },
      update: {
        content: q.content,
        explanation: q.explanation,
        type: q.type ?? QuestionType.SINGLE_CHOICE,
      },
      create: {
        id: questionId,
        content: q.content,
        explanation: q.explanation,
        simulationId,
        order: i + 1,
        type: q.type ?? QuestionType.SINGLE_CHOICE,
        status: QuestionStatus.PUBLISHED,
      },
    });

    for (const opt of q.options) {
      const optionId = buildSeedUuid(
        `option:${question.id}:${opt.order}:${opt.id}`,
      );
      await prisma.option.upsert({
        where: { id: optionId },
        update: {
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: opt.order,
        },
        create: {
          id: optionId,
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: opt.order,
          questionId: question.id,
        },
      });
    }
  }
}

export function buildSingleChoiceQuestion(params: {
  id: string;
  content: string;
  explanation: string;
  correct: string;
  distractors: string[];
  correctOrder?: number;
}): QuestionSeed {
  const correctOrder = params.correctOrder ?? 3;
  const options = [...params.distractors.slice(0, 4)];
  options.splice(correctOrder - 1, 0, params.correct);

  return {
    id: params.id,
    content: params.content,
    explanation: params.explanation,
    type: QuestionType.SINGLE_CHOICE,
    options: options.slice(0, 5).map((text, index) => ({
      id: `${params.id}-${String.fromCharCode(97 + index)}`,
      text,
      isCorrect: text === params.correct,
      order: index + 1,
    })),
  };
}
