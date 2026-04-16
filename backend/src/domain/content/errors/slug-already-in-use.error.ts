import { AppError } from '../../../shared/core/errors/app-error';

export class SlugAlreadyInUseError extends AppError {
  constructor(slug: string) {
    super(`O slug '${slug}' já está em uso.`, 400);
  }
}
