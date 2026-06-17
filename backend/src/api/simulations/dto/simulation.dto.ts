import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const startSimulationSchema = z.object({
  levelId: z
    .string()
    .uuid('ID do nível inválido')
    .describe('ID único (UUID) do Nível/Simulado que o aluno deseja iniciar. Exemplo: 123e4567-e89b-12d3-a456-426614174000'),
});

export const saveAnswerSchema = z.object({
  questionId: z
    .string()
    .uuid('ID da questão inválido')
    .describe('ID único (UUID) da Questão sendo respondida. Exemplo: 123e4567-e89b-12d3-a456-426614174000'),
  selectedOptions: z
    .array(z.string().uuid('ID da opção inválido'))
    .min(1, 'Selecione pelo menos uma opção')
    .describe('Array contendo os IDs das opções que o aluno selecionou.'),
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
    .describe('Indica se o aluno marcou a questão para revisão posterior. Exemplo: true'),
});

export const finishSimulationSchema = z.object({
  timeSpent: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe('Tempo total gasto pelo aluno no simulado em segundos. Exemplo: 3600'),
});

export class StartSimulationDto extends createZodDto(startSimulationSchema) {}
export class SaveAnswerDto extends createZodDto(saveAnswerSchema) {}
export class FinishSimulationDto extends createZodDto(finishSimulationSchema) {}
