import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const startSimulationSchema = z.object({
  simulationId: z
    .uuid('ID do nível inválido')
    .describe(
      'ID UUID do nível/simulado que o aluno deseja iniciar. Ex: "123e4567-e89b-12d3-a456-426614174000"',
    ),
});

export const saveAnswerSchema = z.object({
  questionId: z
    .uuid('ID da questão inválido')
    .describe(
      'ID UUID da questão sendo respondida. Ex: "123e4567-e89b-12d3-a456-426614174000"',
    ),
  selectedOptions: z
    .array(z.uuid('ID da opção inválido'))
    .min(1, 'Selecione pelo menos uma opção')
    .describe(
      'Array contendo os IDs UUID das opções selecionadas pelo aluno. Ex: ["123e4567-e89b-12d3-a456-426614174000"]',
    ),
  timeSpent: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe('Tempo gasto pelo aluno nesta questão em segundos. Exemplo: 45'),
  isFlaggedForReview: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'Indica se o aluno marcou a questão para revisão posterior. Ex: true',
    ),
});

export const finishSimulationSchema = z.object({
  timeSpent: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe(
      'Tempo total gasto pelo aluno no simulado em segundos. Exemplo: 3600',
    ),
});

export class StartSimulationDto extends createZodDto(startSimulationSchema) {}
export class SaveAnswerDto extends createZodDto(saveAnswerSchema) {}
export class FinishSimulationDto extends createZodDto(finishSimulationSchema) {}
