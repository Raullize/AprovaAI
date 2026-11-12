import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { AiChatMessageRepository } from '../../../domain/ai/repositories/ai-chat-message.repository';
import { SimulationAttemptRepository } from '../../../domain/simulations/repositories/simulation-attempt.repository';
import { getCompletedAttemptForUser } from '../attempt-access';
import { ChatHistoryItem } from './get-chat-history.use-case';

export interface GetAttemptChatHistoryRequest {
  userId: string;
  simulationAttemptId: string;
  limit?: number;
}

@Injectable()
export class GetAttemptChatHistoryUseCase implements UseCase<
  GetAttemptChatHistoryRequest,
  ChatHistoryItem[]
> {
  constructor(
    private readonly messageRepository: AiChatMessageRepository,
    private readonly simulationAttemptRepository: SimulationAttemptRepository,
  ) {}

  async execute(
    request: GetAttemptChatHistoryRequest,
  ): Promise<ChatHistoryItem[]> {
    await getCompletedAttemptForUser(
      this.simulationAttemptRepository,
      request.userId,
      request.simulationAttemptId,
    );

    const messages =
      await this.messageRepository.findRecentBySimulationAttemptId(
        request.simulationAttemptId,
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
