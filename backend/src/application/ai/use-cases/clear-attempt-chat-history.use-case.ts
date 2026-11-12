import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { AiChatMessageRepository } from '../../../domain/ai/repositories/ai-chat-message.repository';
import { SimulationAttemptRepository } from '../../../domain/simulations/repositories/simulation-attempt.repository';
import { getCompletedAttemptForUser } from '../attempt-access';

export interface ClearAttemptChatHistoryRequest {
  userId: string;
  simulationAttemptId: string;
}

export interface ClearAttemptChatHistoryResponse {
  message: string;
}

@Injectable()
export class ClearAttemptChatHistoryUseCase implements UseCase<
  ClearAttemptChatHistoryRequest,
  ClearAttemptChatHistoryResponse
> {
  constructor(
    private readonly messageRepository: AiChatMessageRepository,
    private readonly simulationAttemptRepository: SimulationAttemptRepository,
  ) {}

  async execute(
    request: ClearAttemptChatHistoryRequest,
  ): Promise<ClearAttemptChatHistoryResponse> {
    await getCompletedAttemptForUser(
      this.simulationAttemptRepository,
      request.userId,
      request.simulationAttemptId,
    );

    await this.messageRepository.deleteBySimulationAttemptId(
      request.simulationAttemptId,
      request.userId,
    );

    return { message: 'Histórico do chat desta tentativa apagado.' };
  }
}
