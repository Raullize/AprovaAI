import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadImageUseCase } from '../../application/uploads/use-cases/upload-image.use-case';
import { DeleteImageUseCase } from '../../application/uploads/use-cases/delete-image.use-case';
import { StorageProvider } from '../../application/uploads/ports/storage-provider';
import { LocalStorageProvider } from '../../infrastructure/providers/storage/local-storage.provider';

@Module({
  controllers: [UploadController],
  providers: [
    UploadImageUseCase,
    DeleteImageUseCase,
    {
      provide: StorageProvider,
      useClass: LocalStorageProvider,
    },
  ],
})
export class UploadModule {}
