import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { z } from 'zod';
import { generateSlug, generateUniqueSlug } from '../utils/slugify';

const createLevelSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  topicId: z.string().min(1, 'Topic ID é obrigatório'),
  xpReward: z.number().int().min(0).default(10),
  passingPercentage: z.number().int().min(0).max(100).default(70),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

const updateLevelSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  xpReward: z.number().int().min(0).optional(),
  passingPercentage: z.number().int().min(0).max(100).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

class LevelController {
  async index(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });

    const { topicId, search } = req.query;

    if (!topicId) return res.status(400).json({ error: 'topicId é obrigatório' });

    const where = {
      topicId: String(topicId),
      ...(search && {
        name: { contains: String(search), mode: 'insensitive' as const }
      })
    };

    const levels = await prisma.level.findMany({
      where,
      include: {
        _count: { select: { questions: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(levels);
  }

  async show(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
    const id = String(req.params.id);
    const level = await prisma.level.findUnique({ where: { id }, include: { questions: true } });
    if (!level) return res.status(404).json({ error: 'Nível não encontrado' });
    return res.json(level);
  }

  async store(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
    try {
      const data = createLevelSchema.parse(req.body);

      const baseSlug = generateSlug(data.name);
      const slug = await generateUniqueSlug(baseSlug, async (s) => {
        const existing = await prisma.level.findFirst({ where: { slug: s, topicId: data.topicId } });
        return !!existing;
      });

      // Get the highest order for this topic to append the new level at the end
      const lastLevel = await prisma.level.findFirst({
        where: { topicId: data.topicId },
        orderBy: { order: 'desc' }
      });
      const order = lastLevel ? lastLevel.order + 1 : 1;

      const level = await prisma.level.create({
        data: { ...data, slug, order }
      });
      return res.status(201).json(level);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      return res.status(500).json({ error: 'Erro interno' });
    }
  }

  async update(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
    const id = String(req.params.id);
    try {
      const data = updateLevelSchema.parse(req.body);
      let updateData: any = { ...data };

      if (data.name) {
        const current = await prisma.level.findUnique({ where: { id } });
        if (current) {
          const baseSlug = generateSlug(data.name);
          const slug = await generateUniqueSlug(baseSlug, async (s) => {
            const existing = await prisma.level.findFirst({ where: { slug: s, topicId: current.topicId, id: { not: id } } });
            return !!existing;
          });
          updateData.slug = slug;
        }
      }

      const level = await prisma.level.update({ where: { id }, data: updateData });
      return res.json(level);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      return res.status(500).json({ error: 'Erro interno' });
    }
  }

  async delete(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
    const id = String(req.params.id);
    try {
      await prisma.level.delete({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar' });
    }
  }

  async reorder(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Acesso negado' });
    const { ids } = req.body as { ids: string[] };
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids deve ser um array' });
    try {
      await prisma.$transaction(
        ids.map((id, index) =>
          prisma.level.update({ where: { id }, data: { order: index } })
        )
      );
      return res.status(204).send();
    } catch {
      return res.status(500).json({ error: 'Erro ao reordenar' });
    }
  }
}

export default new LevelController();
