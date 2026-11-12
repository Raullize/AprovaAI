import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { AiChatMessageRepository } from '../../../domain/ai/repositories/ai-chat-message.repository';
import { ChatRole } from '../../../domain/ai/entities/ai-chat-message.entity';

export interface GetChatHistoryRequest {
  userId: string;
  limit?: number;
}

export interface ChatHistoryItem {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

@Injectable()
export class GetChatHistoryUseCase implements UseCase<
  GetChatHistoryRequest,
  ChatHistoryItem[]
> {
  constructor(private readonly messageRepository: AiChatMessageRepository) {}

  async execute(request: GetChatHistoryRequest): Promise<ChatHistoryItem[]> {
    const messages = await this.messageRepository.findRecentByUserId(
      request.userId,
      request.limit ?? 20,
    );

    return messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: (message.createdAt ?? new Date()).toISOString(),
    }));
  }
}
