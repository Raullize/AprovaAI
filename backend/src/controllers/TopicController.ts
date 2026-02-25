import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { z } from 'zod';
import { generateSlug, generateUniqueSlug } from '../utils/slugify';

const createTopicSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  examId: z.string().min(1, 'Exam ID é obrigatório'),
});

const updateTopicSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().optional(),
});

class TopicController {
  async index(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
    
    const { examId, search } = req.query;

    if (!examId) return res.status(400).json({ error: 'examId é obrigatório' });

    const where = {
      examId: String(examId),
      ...(search && {
        name: { contains: String(search), mode: 'insensitive' as const }
      })
    };

    const topics = await prisma.topic.findMany({
      where,
      include: {
        _count: { select: { levels: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(topics);
  }

  async show(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
    const { id } = req.params;
    const topic = await prisma.topic.findUnique({ where: { id }, include: { levels: true } });
    if (!topic) return res.status(404).json({ error: 'Tópico não encontrado' });
    return res.json(topic);
  }

  async store(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
    try {
      const data = createTopicSchema.parse(req.body);
      
      const baseSlug = generateSlug(data.name);
      const slug = await generateUniqueSlug(baseSlug, async (s) => {
        const existing = await prisma.topic.findFirst({ where: { slug: s, examId: data.examId } });
        return !!existing;
      });

      const topic = await prisma.topic.create({
        data: { ...data, slug }
      });
      return res.status(201).json(topic);
    } catch (error) {
       if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
       return res.status(500).json({ error: 'Erro interno' });
    }
  }

  async update(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
    const { id } = req.params;
    try {
      const data = updateTopicSchema.parse(req.body);
      let updateData: any = { ...data };

      if (data.name) {
        const current = await prisma.topic.findUnique({ where: { id } });
        if (current) {
             const baseSlug = generateSlug(data.name);
             const slug = await generateUniqueSlug(baseSlug, async (s) => {
                const existing = await prisma.topic.findFirst({ where: { slug: s, examId: current.examId, id: { not: id } } });
                return !!existing;
             });
             updateData.slug = slug;
        }
      }
      
      const topic = await prisma.topic.update({ where: { id }, data: updateData });
      return res.json(topic);
    } catch (error) {
       if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });
       return res.status(500).json({ error: 'Erro interno' });
    }
  }

  async delete(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
    const { id } = req.params;
    try {
      await prisma.topic.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar' });
    }
  }
}

export default new TopicController();
