import { AppError } from '../../../shared/core/errors/app-error';

export class InvalidCurrentPasswordError extends AppError {
  constructor() {
    super('Senha atual incorreta.', 400);
  }
}
