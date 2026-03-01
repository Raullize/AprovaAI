import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
    async removeFile(filename: string) {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        const filePath = path.join(process.cwd(), uploadDir, filename);
        const legacyFilePath = path.join(process.cwd(), '..', 'backend', 'uploads', filename);

        let fileToDelete = filePath;
        if (!fs.existsSync(filePath) && fs.existsSync(legacyFilePath)) {
            fileToDelete = legacyFilePath;
        }

        if (fs.existsSync(fileToDelete)) {
            try {
                fs.unlinkSync(fileToDelete);
                return { message: 'Arquivo deletado com sucesso' };
            } catch (error) {
                throw new Error('Erro ao deletar arquivo');
            }
        } else {
            throw new NotFoundException('Arquivo não encontrado');
        }
    }
}
