import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { z } from 'zod';
import { generateSlug, generateUniqueSlug } from '../utils/slugify';

const createExamSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

const updateExamSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

class ExamController {
  async index(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
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
        order: 'asc',
      },
    });

    return res.json(exams);
  }

  async show(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const id = String(req.params.id);

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        topics: {
          include: {
            _count: {
              select: {
                levels: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            topics: true,
          },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({ error: 'Exame não encontrado' });
    }

    return res.json(exam);
  }

  async store(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    try {
      const validatedData = createExamSchema.parse(req.body);

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

      return res.status(201).json(exam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: (error as z.ZodError).issues });
      }
      return res.status(500).json({ error: 'Erro interno' });
    }
  }

  async update(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const id = String(req.params.id);

    try {
      const validatedData = updateExamSchema.parse(req.body);

      let updateData: any = { ...validatedData };

      if (validatedData.name) {
        const baseSlug = generateSlug(validatedData.name);
        const slug = await generateUniqueSlug(
          baseSlug,
          async (slug) => {
            const existing = await prisma.exam.findFirst({
              where: {
                slug,
                id: { not: id }
              }
            });
            return !!existing;
          }
        );
        updateData.slug = slug;
      }

      const exam = await prisma.exam.update({
        where: { id },
        data: updateData,
      });

      return res.json(exam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: (error as z.ZodError).issues });
      }
      return res.status(500).json({ error: 'Erro interno' });
    }
  }

  async delete(req: Request, res: Response) {
    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const id = String(req.params.id);

    try {
      await prisma.exam.delete({
        where: { id },
      });
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
          prisma.exam.update({ where: { id }, data: { order: index } })
        )
      );
      return res.status(204).send();
    } catch {
      return res.status(500).json({ error: 'Erro ao reordenar' });
    }
  }
}

export default new ExamController();
