import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
import { SendAttemptChatMessageUseCase } from '../../application/ai/use-cases/send-attempt-chat-message.use-case';
import { GetAttemptChatHistoryUseCase } from '../../application/ai/use-cases/get-attempt-chat-history.use-case';
import { ClearChatHistoryUseCase } from '../../application/ai/use-cases/clear-chat-history.use-case';
import { ClearAttemptChatHistoryUseCase } from '../../application/ai/use-cases/clear-attempt-chat-history.use-case';
import { MessageResponseDto } from '../shared/dto/message-response.dto';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(
    private readonly sendChatMessageUseCase: SendChatMessageUseCase,
    private readonly getChatHistoryUseCase: GetChatHistoryUseCase,
    private readonly sendAttemptChatMessageUseCase: SendAttemptChatMessageUseCase,
    private readonly getAttemptChatHistoryUseCase: GetAttemptChatHistoryUseCase,
    private readonly clearChatHistoryUseCase: ClearChatHistoryUseCase,
    private readonly clearAttemptChatHistoryUseCase: ClearAttemptChatHistoryUseCase,
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

  @Post('attempts/:attemptId/chat')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Conversar com o Professor Sabichão sobre uma tentativa',
    description:
      'Envia uma mensagem ao assistente com o contexto da tentativa concluída: exame, tópico, simulado, questões, respostas e desempenho do aluno.',
  })
  @ApiResponse({
    status: 201,
    description: 'Resposta gerada com sucesso.',
    type: ChatReplyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Identificador de tentativa ou mensagem inválidos.',
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 404,
    description: 'Tentativa não encontrada para este aluno.',
  })
  @ApiResponse({
    status: 409,
    description: 'A tentativa ainda não foi concluída.',
  })
  sendAboutAttempt(
    @Request() req: { user: { id: string } },
    @Param('attemptId', new ParseUUIDPipe()) attemptId: string,
    @Body(new ZodValidationPipe(sendChatMessageSchema))
    dto: SendChatMessageDto,
  ) {
    return this.sendAttemptChatMessageUseCase.execute({
      userId: req.user.id,
      simulationAttemptId: attemptId,
      message: dto.message,
    });
  }

  @Get('attempts/:attemptId/chat/history')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Histórico do Professor Sabichão por tentativa',
    description:
      'Retorna as mensagens mais recentes da conversa do aluno sobre uma tentativa concluída.',
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico retornado com sucesso.',
    type: ChatHistoryItemDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 404,
    description: 'Tentativa não encontrada para este aluno.',
  })
  @ApiResponse({
    status: 409,
    description: 'A tentativa ainda não foi concluída.',
  })
  attemptHistory(
    @Request() req: { user: { id: string } },
    @Param('attemptId', new ParseUUIDPipe()) attemptId: string,
    @Query(new ZodValidationPipe(chatHistoryQuerySchema))
    query: ChatHistoryQueryDto,
  ) {
    return this.getAttemptChatHistoryUseCase.execute({
      userId: req.user.id,
      simulationAttemptId: attemptId,
      limit: query.limit,
    });
  }

  @Delete('chat/history')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Apagar o histórico do chat',
    description:
      'Remove permanentemente todas as mensagens do chat global do aluno autenticado. As conversas por tentativa são preservadas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico apagado com sucesso.',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  clearHistory(@Request() req: { user: { id: string } }) {
    return this.clearChatHistoryUseCase.execute({ userId: req.user.id });
  }

  @Delete('attempts/:attemptId/chat/history')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Apagar o histórico do chat de uma tentativa',
    description:
      'Remove permanentemente as mensagens do chat associado a uma tentativa concluída do aluno autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico da tentativa apagado com sucesso.',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido.' })
  @ApiResponse({
    status: 404,
    description: 'Tentativa não encontrada para este aluno.',
  })
  @ApiResponse({
    status: 409,
    description: 'A tentativa ainda não foi concluída.',
  })
  clearAttemptHistory(
    @Request() req: { user: { id: string } },
    @Param('attemptId', new ParseUUIDPipe()) attemptId: string,
  ) {
    return this.clearAttemptChatHistoryUseCase.execute({
      userId: req.user.id,
      simulationAttemptId: attemptId,
    });
  }
}
