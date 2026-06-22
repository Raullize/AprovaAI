import { AppError } from '../../../shared/core/errors/app-error';

export class InvalidReorderError extends AppError {
  constructor(message: string = 'A reordenação fornecida é inválida.') {
    super(message, 400);
  }
}
