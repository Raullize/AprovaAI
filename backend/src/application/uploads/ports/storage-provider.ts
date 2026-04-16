export interface FileData {
  filename: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export abstract class StorageProvider {
  abstract save(file: FileData, folder: string): Promise<string>;
  abstract delete(fileUrl: string): Promise<void>;
}
