import { AppError } from './app-error';

export class ResourceNotFoundError extends AppError {
  constructor(resourceName: string, identifier: string) {
    super(`${resourceName} with identifier '${identifier}' not found`, 404);
    this.name = 'ResourceNotFoundError';
  }
}
