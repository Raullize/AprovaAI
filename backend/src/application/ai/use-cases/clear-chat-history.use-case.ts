import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { AiChatMessageRepository } from '../../../domain/ai/repositories/ai-chat-message.repository';

export interface ClearChatHistoryRequest {
  userId: string;
}

export interface ClearChatHistoryResponse {
  message: string;
}

@Injectable()
export class ClearChatHistoryUseCase implements UseCase<
  ClearChatHistoryRequest,
  ClearChatHistoryResponse
> {
  constructor(private readonly messageRepository: AiChatMessageRepository) {}

  async execute(
    request: ClearChatHistoryRequest,
  ): Promise<ClearChatHistoryResponse> {
    await this.messageRepository.deleteByUserId(request.userId);

    return { message: 'Histórico do chat apagado.' };
  }
}
