import {
    Controller,
    Post,
    Delete,
    Param,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as crypto from 'crypto';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: process.env.UPLOAD_DIR || './uploads',
                filename: (req, file, cb) => {
                    const fileHash = crypto.randomBytes(16).toString('hex');
                    const ext = path.extname(file.originalname);
                    cb(null, `${fileHash}${ext}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (allowedMimes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new BadRequestException('Tipo de arquivo não suportado.'), false);
                }
            },
            limits: {
                fileSize: 5 * 1024 * 1024,
            },
        })
    )
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Nenhum arquivo enviado');
        }

        return {
            url: `/uploads/${file.filename}`,
            filename: file.filename,
        };
    }

    @Delete(':filename')
    @Roles(UserRole.ADMIN)
    removeFile(@Param('filename') filename: string) {
        return this.uploadService.removeFile(filename);
    }
}
