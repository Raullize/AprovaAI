import { AppError } from '../../../shared/core/errors/app-error';

export class InvalidEmailError extends AppError {
  constructor(email: string) {
    super(`The email "${email}" is invalid.`, 400);
    this.name = 'InvalidEmailError';
  }
}
