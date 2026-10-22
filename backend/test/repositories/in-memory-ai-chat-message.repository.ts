import { AiChatMessage } from '../../src/domain/ai/entities/ai-chat-message.entity';
import { AiChatMessageRepository } from '../../src/domain/ai/repositories/ai-chat-message.repository';

export class InMemoryAiChatMessageRepository implements AiChatMessageRepository {
  public items: AiChatMessage[] = [];

  create(message: AiChatMessage): Promise<AiChatMessage> {
    this.items.push(message);
    return Promise.resolve(message);
  }

  findRecentByUserId(userId: string, limit: number): Promise<AiChatMessage[]> {
    const messages = this.items.filter((item) => item.userId === userId);
    return Promise.resolve(messages.slice(-limit));
  }
}
