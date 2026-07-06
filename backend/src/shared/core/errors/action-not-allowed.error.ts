import { AppError } from './app-error';

export class ActionNotAllowedError extends AppError {
  constructor(message: string) {
    super(message, 403);
    this.name = 'ActionNotAllowedError';
  }
}
