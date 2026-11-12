import {
  AiChatMessage as PrismaAiChatMessage,
  ChatRole as PrismaChatRole,
} from '@prisma/client';
import {
  AiChatMessage,
  ChatRole,
} from '../../../../domain/ai/entities/ai-chat-message.entity';

export class PrismaAiChatMessageMapper {
  static toDomain(raw: PrismaAiChatMessage): AiChatMessage {
    return AiChatMessage.create(
      {
        userId: raw.userId,
        role: raw.role as ChatRole,
        content: raw.content,
        simulationAttemptId: raw.simulationAttemptId,
        createdAt: raw.createdAt,
      },
      raw.id,
    );
  }

  static toPrisma(message: AiChatMessage): PrismaAiChatMessage {
    return {
      id: message.id,
      userId: message.userId,
      role: message.role as PrismaChatRole,
      content: message.content,
      simulationAttemptId: message.simulationAttemptId ?? null,
      createdAt: message.createdAt ?? new Date(),
    };
  }
}
