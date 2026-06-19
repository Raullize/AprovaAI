import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const updateStudentProfileSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Nome completo nao pode ser vazio.')
      .optional()
      .describe('Nome completo atualizado do estudante.'),
    email: z
      .string()
      .email('E-mail invalido')
      .optional()
      .describe('Novo e-mail do estudante.'),
    username: z
      .string()
      .min(1, 'Nome de usuario nao pode ser vazio.')
      .optional()
      .describe('Novo nome de usuario do estudante.'),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar o perfil.',
  });

export class UpdateStudentProfileDto extends createZodDto(
  updateStudentProfileSchema,
) {}

export const updateStudentPasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Senha atual e obrigatoria.')
    .describe('Senha atual do estudante.'),
  newPassword: z
    .string()
    .min(6, 'A senha deve ter no minimo 6 caracteres')
    .describe('Nova senha do estudante.'),
});

export class UpdateStudentPasswordDto extends createZodDto(
  updateStudentPasswordSchema,
) {}
