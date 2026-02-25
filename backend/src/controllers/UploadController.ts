import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

class UploadController {
    async store(req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const url = `/uploads/${req.file.filename}`;
        return res.status(201).json({ url, filename: req.file.filename });
    }

    async delete(req: Request, res: Response) {
        const filename = String(req.params.filename);

        // Segurança: não permitir path traversal
        if (filename.includes('/') || filename.includes('..')) {
            return res.status(400).json({ error: 'Nome de arquivo inválido' });
        }

        const uploadsDir = path.resolve(process.cwd(), 'uploads');
        const filePath = path.join(uploadsDir, filename);

        // Verificar se o arquivo existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Arquivo não encontrado' });
        }

        try {
            fs.unlinkSync(filePath);
            return res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar arquivo:', error);
            return res.status(500).json({ error: 'Erro ao deletar arquivo' });
        }
    }
}

export default new UploadController();
