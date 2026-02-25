import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { z } from 'zod';

const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Texto da alternativa é obrigatório'),
  isCorrect: z.boolean().default(false),
  order: z.number().int().min(1, 'Ordem deve ser um número positivo'),
});

const createQuestionSchema = z.object({
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  levelId: z.string().min(1, 'Level ID é obrigatório'),
  type: z.enum(['MULTIPLE_CHOICE', 'SINGLE_CHOICE']).default('SINGLE_CHOICE'),
  imageUrl: z.string().optional().or(z.literal('')),
  options: z.array(z.object({
    text: z.string().min(1, 'Texto da opção é obrigatório'),
    isCorrect: z.boolean(),
    order: z.number().int().min(0)
  })).min(2, 'Pelo menos 2 opções são obrigatórias')
});

const updateQuestionSchema = z.object({
  content: z.string().min(1, 'Conteúdo da questão é obrigatório').optional(),
  type: z.enum(['MULTIPLE_CHOICE', 'SINGLE_CHOICE']).optional(),
  explanation: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal('')),
  options: z.array(optionSchema).min(2, 'Deve ter pelo menos 2 alternativas').max(6, 'Máximo de 6 alternativas').optional(),
});

class QuestionController {
  async index(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });

    const { levelId, search } = req.query;

    if (!levelId) return res.status(400).json({ error: 'levelId é obrigatório' });

    const where = {
      levelId: String(levelId),
      ...(search && {
        content: { contains: String(search), mode: 'insensitive' as const }
      })
    };

    const questions = await prisma.question.findMany({
      where,
      include: {
        options: { orderBy: { order: 'asc' } }
      },
      orderBy: { order: 'asc' }
    });

    return res.json(questions);
  }

  async show(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
    const id = String(req.params.id);
    const question = await prisma.question.findUnique({ where: { id }, include: { options: { orderBy: { order: 'asc' } } } });
    if (!question) return res.status(404).json({ error: 'Questão não encontrada' });
    return res.json(question);
  }

  async store(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
    try {
      const data = createQuestionSchema.parse(req.body);

      const lastQuestion = await prisma.question.findFirst({
        where: { levelId: data.levelId },
        orderBy: { order: 'desc' }
      });
      const nextOrder = (lastQuestion?.order || 0) + 1;

      const question = await prisma.question.create({
        data: {
          content: data.content,
          levelId: data.levelId,
          type: data.type,
          imageUrl: data.imageUrl,
          order: nextOrder,
          options: {
            create: data.options.map(opt => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
              order: opt.order
            }))
          }
        },
        include: { options: true }
      });
      return res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: (error as z.ZodError).issues });
      return res.status(500).json({ error: 'Erro interno' });
    }
  }

  async update(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
    const id = String(req.params.id);
    try {
      const data = updateQuestionSchema.parse(req.body);

      // Se tiver options, deleta as antigas e cria as novas (transaction simplificada)
      if (data.options) {
        await prisma.$transaction([
          prisma.option.deleteMany({ where: { questionId: id } }),
          prisma.question.update({
            where: { id },
            data: {
              content: data.content,
              type: data.type,
              explanation: data.explanation,
              imageUrl: data.imageUrl,
              options: {
                create: data.options.map(opt => ({
                  text: opt.text,
                  isCorrect: opt.isCorrect,
                  order: opt.order
                }))
              }
            }
          })
        ]);
        const updated = await prisma.question.findUnique({ where: { id }, include: { options: true } });
        return res.json(updated);
      } else {
        const { options: _options, ...updateData } = data;
        const question = await prisma.question.update({ where: { id }, data: updateData });
        return res.json(question);
      }
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ error: (error as z.ZodError).issues });
      console.error(error);
      return res.status(500).json({ error: 'Erro interno' });
    }
  }

  async delete(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
    const id = String(req.params.id);
    try {
      await prisma.question.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar' });
    }
  }
}

export default new QuestionController();
