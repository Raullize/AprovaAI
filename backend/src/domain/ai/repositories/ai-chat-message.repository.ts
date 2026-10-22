import { AiChatMessage } from '../entities/ai-chat-message.entity';

export abstract class AiChatMessageRepository {
  abstract create(message: AiChatMessage): Promise<AiChatMessage>;

  abstract findRecentByUserId(
    userId: string,
    limit: number,
  ): Promise<AiChatMessage[]>;
}
