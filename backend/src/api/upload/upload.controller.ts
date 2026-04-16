import {
  Controller,
  Post,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';

import { UploadImageUseCase } from '../../application/uploads/use-cases/upload-image.use-case';
import { DeleteImageUseCase } from '../../application/uploads/use-cases/delete-image.use-case';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(
    private readonly uploadImageUseCase: UploadImageUseCase,
    private readonly deleteImageUseCase: DeleteImageUseCase,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Tipo de arquivo não suportado.'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    const fileUrl = await this.uploadImageUseCase.execute({
      file: {
        filename: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer,
        size: file.size,
      },
      folder: folder || 'questions',
    });

    return {
      url: fileUrl,
    };
  }

  @Delete(':filename')
  @Roles(UserRole.ADMIN)
  async removeFile(@Param('filename') filename: string) {
    if (!filename) {
      throw new BadRequestException('Nome do arquivo não fornecido');
    }
    const fileUrl = `/uploads/questions/${filename}`;
    await this.deleteImageUseCase.execute(fileUrl);
    return { message: 'Arquivo deletado com sucesso' };
  }
}
