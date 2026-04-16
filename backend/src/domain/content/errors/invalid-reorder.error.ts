import { AppError } from '../../../shared/core/errors/app-error';

export class InvalidReorderError extends AppError {
  constructor() {
    super('A reordenação fornecida é inválida.', 400);
  }
}
