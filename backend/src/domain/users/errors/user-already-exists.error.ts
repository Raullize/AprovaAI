import { AppError } from '../../../shared/core/errors/app-error';

export class UserAlreadyExistsError extends AppError {
  constructor(field: 'email' | 'username') {
    super(
      `Este ${field === 'email' ? 'e-mail' : 'nome de usuário'} já está em uso.`,
      400,
    );
  }
}
