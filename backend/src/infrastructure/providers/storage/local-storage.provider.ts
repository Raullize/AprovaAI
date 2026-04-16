import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  StorageProvider,
  FileData,
} from '../../../application/uploads/ports/storage-provider';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadDir = process.env.UPLOAD_DIR || 'uploads';

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists() {
    try {
      const fullPath = path.join(process.cwd(), this.uploadDir);
      await fs.mkdir(fullPath, { recursive: true });
    } catch (error) {
      this.logger.error('Error creating upload directory', error);
    }
  }

  async save(file: FileData, folder: string): Promise<string> {
    try {
      const folderPath = path.join(process.cwd(), this.uploadDir, folder);
      await fs.mkdir(folderPath, { recursive: true });

      const fileExtension = path.extname(file.filename);
      const randomName = crypto.randomBytes(16).toString('hex');
      const newFilename = `${randomName}${fileExtension}`;

      const filePath = path.join(folderPath, newFilename);
      await fs.writeFile(filePath, file.buffer);

      return `${this.uploadDir}/${folder}/${newFilename}`;
    } catch (error) {
      this.logger.error('Error saving file locally', error);
      throw new InternalServerErrorException('Error saving file');
    }
  }

  async delete(fileUrl: string): Promise<void> {
    if (!fileUrl) return;

    try {
      const relativePath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
      const fullPath = path.join(process.cwd(), relativePath);

      try {
        await fs.access(fullPath);
        await fs.unlink(fullPath);
      } catch {
        this.logger.warn(`File not found for deletion: ${fullPath}`);
      }
    } catch (error) {
      this.logger.error('Error deleting local file', error);
    }
  }
}
