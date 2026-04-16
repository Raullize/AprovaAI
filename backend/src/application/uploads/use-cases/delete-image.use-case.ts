import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { StorageProvider } from '../ports/storage-provider';

@Injectable()
export class DeleteImageUseCase implements UseCase<string, void> {
  constructor(private readonly storageProvider: StorageProvider) {}

  async execute(fileUrl: string): Promise<void> {
    await this.storageProvider.delete(fileUrl);
  }
}
