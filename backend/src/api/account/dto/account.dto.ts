import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const updateAccountProfileSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Nome completo nao pode ser vazio.')
      .optional()
      .describe('Novo nome completo do usuario autenticado. Ex: Raul Lize'),
    email: z
      .string()
      .email('E-mail invalido')
      .optional()
      .describe('Novo e-mail principal da conta. Ex: aluno@aprovaai.com'),
    username: z
      .string()
      .min(1, 'Nome de usuario nao pode ser vazio.')
      .optional()
      .describe('Novo nome de usuario unico da conta. Ex: raullize'),
    avatarUrl: z
      .string()
      .nullable()
      .optional()
      .describe('URL ou caminho do novo avatar do usuario.'),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar o perfil.',
  });

export class UpdateAccountProfileDto extends createZodDto(
  updateAccountProfileSchema,
) {}

export const updateAccountPasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Senha atual e obrigatoria.')
    .describe('Senha atual utilizada para confirmar a alteracao.'),
  newPassword: z
    .string()
    .min(6, 'A senha deve ter no minimo 6 caracteres')
    .describe(
      'Nova senha da conta com no minimo 6 caracteres. Ex: novaSenha123',
    ),
});

export class UpdateAccountPasswordDto extends createZodDto(
  updateAccountPasswordSchema,
) {}
