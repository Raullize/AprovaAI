import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ChatHistoryItemDto,
  ChatHistoryQueryDto,
  chatHistoryQuerySchema,
  ChatReplyResponseDto,
  SendChatMessageDto,
  sendChatMessageSchema,
} from './dto/ai.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { SendChatMessageUseCase } from '../../application/ai/use-cases/send-chat-message.use-case';
import { GetChatHistoryUseCase } from '../../application/ai/use-cases/get-chat-history.use-case';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(
    private readonly sendChatMessageUseCase: SendChatMessageUseCase,
    private readonly getChatHistoryUseCase: GetChatHistoryUseCase,
  ) {}

  @Post('chat')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Conversar com o Professor Sabichão',
    description:
      'Envia uma mensagem ao assistente pedagógico. Responde dúvidas de conteúdo e sobre o uso do AprovaAI (lado do estudante).',
  })
  @ApiResponse({
    status: 201,
    description: 'Resposta gerada com sucesso.',
    type: ChatReplyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Mensagem inválida (vazia ou acima de 1000 caracteres).',
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  send(
    @Request() req: { user: { id: string } },
    @Body(new ZodValidationPipe(sendChatMessageSchema))
    dto: SendChatMessageDto,
  ) {
    return this.sendChatMessageUseCase.execute({
      userId: req.user.id,
      message: dto.message,
    });
  }

  @Get('chat/history')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Histórico do Professor Sabichão',
    description:
      'Retorna as mensagens mais recentes da conversa do estudante com o assistente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico retornado com sucesso.',
    type: ChatHistoryItemDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  history(
    @Request() req: { user: { id: string } },
    @Query(new ZodValidationPipe(chatHistoryQuerySchema))
    query: ChatHistoryQueryDto,
  ) {
    return this.getChatHistoryUseCase.execute({
      userId: req.user.id,
      limit: query.limit,
    });
  }
}
