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
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';

import { UploadImageUseCase } from '../../application/uploads/use-cases/upload-image.use-case';
import { DeleteImageUseCase } from '../../application/uploads/use-cases/delete-image.use-case';

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(
    private readonly uploadImageUseCase: UploadImageUseCase,
    private readonly deleteImageUseCase: DeleteImageUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Enviar Imagem',
    description:
      'Faz upload de uma imagem (JPEG, PNG, GIF ou WEBP até 5MB) e retorna a ' +
      'URL pública do arquivo salvo. Requer autenticação.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Arquivo de imagem (image/jpeg, image/png, image/gif, image/webp).',
        },
        folder: {
          type: 'string',
          description: 'Pasta de destino (padrão: questions).',
          example: 'questions',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload realizado com sucesso. Retorna a URL do arquivo.',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL pública do arquivo salvo.' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Arquivo não enviado ou tipo não suportado.',
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
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
  @ApiOperation({
    summary: 'Excluir Imagem',
    description: 'Remove uma imagem da pasta `questions`. (Somente Admin)',
  })
  @ApiParam({
    name: 'filename',
    description: 'Nome do arquivo a ser removido (ex: abc123.png).',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo deletado com sucesso.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Mensagem de confirmação.' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Nome do arquivo não fornecido.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado (requer role ADMIN).',
  })
  async removeFile(@Param('filename') filename: string) {
    if (!filename) {
      throw new BadRequestException('Nome do arquivo não fornecido');
    }
    const fileUrl = `/uploads/questions/${filename}`;
    await this.deleteImageUseCase.execute(fileUrl);
    return { message: 'Arquivo deletado com sucesso' };
  }
}
