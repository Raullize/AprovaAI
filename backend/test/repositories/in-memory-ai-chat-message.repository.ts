import { AiChatMessage } from '../../src/domain/ai/entities/ai-chat-message.entity';
import { AiChatMessageRepository } from '../../src/domain/ai/repositories/ai-chat-message.repository';

export class InMemoryAiChatMessageRepository implements AiChatMessageRepository {
  public items: AiChatMessage[] = [];

  create(message: AiChatMessage): Promise<AiChatMessage> {
    this.items.push(message);
    return Promise.resolve(message);
  }

  findRecentByUserId(userId: string, limit: number): Promise<AiChatMessage[]> {
    const messages = this.items.filter(
      (item) => item.userId === userId && !item.simulationAttemptId,
    );
    return Promise.resolve(messages.slice(-limit));
  }

  findRecentBySimulationAttemptId(
    simulationAttemptId: string,
    userId: string,
    limit: number,
  ): Promise<AiChatMessage[]> {
    const messages = this.items.filter(
      (item) =>
        item.userId === userId &&
        item.simulationAttemptId === simulationAttemptId,
    );
    return Promise.resolve(messages.slice(-limit));
  }

  deleteByUserId(userId: string): Promise<void> {
    this.items = this.items.filter(
      (item) => item.userId !== userId || item.simulationAttemptId,
    );
    return Promise.resolve();
  }

  deleteBySimulationAttemptId(
    simulationAttemptId: string,
    userId: string,
  ): Promise<void> {
    this.items = this.items.filter(
      (item) =>
        item.userId !== userId ||
        item.simulationAttemptId !== simulationAttemptId,
    );
    return Promise.resolve();
  }
}
