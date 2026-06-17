import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const startSimulationSchema = z.object({
  levelId: z.string().uuid('ID do nível inválido'),
});

export class StartSimulationDto extends createZodDto(startSimulationSchema) {}

export const saveAnswerSchema = z.object({
  questionId: z.string().uuid('ID da questão inválido'),
  selectedOptions: z.array(z.string().uuid('ID da opção inválido')).min(1, 'Selecione pelo menos uma opção'),
  timeSpent: z.number().int().min(0).optional(),
  isFlaggedForReview: z.boolean().optional().default(false),
});

export class SaveAnswerDto extends createZodDto(saveAnswerSchema) {}

export const finishSimulationSchema = z.object({
  timeSpent: z.number().int().min(0).optional(),
});

export class FinishSimulationDto extends createZodDto(finishSimulationSchema) {}
