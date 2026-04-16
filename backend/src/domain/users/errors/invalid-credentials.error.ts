import { AppError } from '../../../shared/core/errors/app-error';

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('Credenciais inválidas', 401);
  }
}
