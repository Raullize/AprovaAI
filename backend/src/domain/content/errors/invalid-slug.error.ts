import { AppError } from '../../../shared/core/errors/app-error';

export class InvalidSlugError extends AppError {
  constructor(slug: string) {
    super(`The slug "${slug}" is invalid.`, 400);
    this.name = 'InvalidSlugError';
  }
}
