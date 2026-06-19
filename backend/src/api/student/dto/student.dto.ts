import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const updateStudentProfileSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Nome completo nao pode ser vazio.')
      .optional()
      .describe('Novo nome completo do estudante. Ex: Raul Lize'),
    email: z
      .string()
      .email('E-mail invalido')
      .optional()
      .describe('Novo e-mail principal do estudante. Ex: aluno@aprovaai.com'),
    username: z
      .string()
      .min(1, 'Nome de usuario nao pode ser vazio.')
      .optional()
      .describe('Novo nome de usuario unico do estudante. Ex: raullize'),
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
    .describe('Senha atual utilizada para confirmar a alteracao.'),
  newPassword: z
    .string()
    .min(6, 'A senha deve ter no minimo 6 caracteres')
    .describe('Nova senha da conta com no minimo 6 caracteres. Ex: novaSenha123'),
});

export class UpdateStudentPasswordDto extends createZodDto(
  updateStudentPasswordSchema,
) {}
