import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { StorageProvider, FileData } from '../ports/storage-provider';

export interface UploadImageRequest {
  file: FileData;
  folder: string;
}

@Injectable()
export class UploadImageUseCase implements UseCase<UploadImageRequest, string> {
  constructor(private readonly storageProvider: StorageProvider) {}

  async execute(request: UploadImageRequest): Promise<string> {
    return this.storageProvider.save(request.file, request.folder);
  }
}
