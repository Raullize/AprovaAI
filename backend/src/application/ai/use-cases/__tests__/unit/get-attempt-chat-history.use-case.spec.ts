import { GetAttemptChatHistoryUseCase } from '../../get-attempt-chat-history.use-case';
import { InMemoryAiChatMessageRepository } from '../../../../../../test/repositories/in-memory-ai-chat-message.repository';
import { InMemorySimulationAttemptRepository } from '../../../../../../test/repositories/in-memory-simulation-attempt.repository';
import { AiChatMessage } from '../../../../../domain/ai/entities/ai-chat-message.entity';
import { SimulationAttempt } from '../../../../../domain/simulations/entities/simulation-attempt.entity';
import { ConflictError } from '../../../../../shared/core/errors/conflict.error';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

function buildAttempt(
  overrides: Partial<Parameters<typeof SimulationAttempt.create>[0]> = {},
): SimulationAttempt {
  return SimulationAttempt.create(
    {
      userId: 'user-1',
      simulationId: 'simulation-1',
      status: 'COMPLETED',
      totalQuestions: 2,
      ...overrides,
    },
    'attempt-1',
  );
}

describe('GetAttemptChatHistoryUseCase', () => {
  let messageRepository: InMemoryAiChatMessageRepository;
  let attemptRepository: InMemorySimulationAttemptRepository;

  beforeEach(() => {
    messageRepository = new InMemoryAiChatMessageRepository();
    attemptRepository = new InMemorySimulationAttemptRepository();
  });

  function buildSut() {
    return new GetAttemptChatHistoryUseCase(
      messageRepository,
      attemptRepository,
    );
  }

  it('should return only the messages from the given attempt', async () => {
    await attemptRepository.create(buildAttempt());

    await messageRepository.create(
      AiChatMessage.create({
        userId: 'user-1',
        role: 'USER',
        content: 'chat global',
      }),
    );
    await messageRepository.create(
      AiChatMessage.create({
        userId: 'user-1',
        simulationAttemptId: 'attempt-1',
        role: 'USER',
        content: 'mensagem da tentativa',
      }),
    );
    await messageRepository.create(
      AiChatMessage.create({
        userId: 'user-1',
        simulationAttemptId: 'attempt-1',
        role: 'ASSISTANT',
        content: 'resposta da tentativa',
      }),
    );
    await messageRepository.create(
      AiChatMessage.create({
        userId: 'user-1',
        simulationAttemptId: 'attempt-2',
        role: 'USER',
        content: 'mensagem de outra tentativa',
      }),
    );

    const sut = buildSut();
    const history = await sut.execute({
      userId: 'user-1',
      simulationAttemptId: 'attempt-1',
    });

    expect(history).toHaveLength(2);
    expect(history.map((item) => item.content)).toEqual([
      'mensagem da tentativa',
      'resposta da tentativa',
    ]);
    expect(history[0]).toHaveProperty('createdAt');
    expect(history[0]).toHaveProperty('role');
  });

  it('should reject attempts that belong to another user', async () => {
    await attemptRepository.create(buildAttempt({ userId: 'user-2' }));
    const sut = buildSut();

    await expect(
      sut.execute({ userId: 'user-1', simulationAttemptId: 'attempt-1' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should reject attempts that are not completed', async () => {
    await attemptRepository.create(buildAttempt({ status: 'IN_PROGRESS' }));
    const sut = buildSut();

    await expect(
      sut.execute({ userId: 'user-1', simulationAttemptId: 'attempt-1' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
