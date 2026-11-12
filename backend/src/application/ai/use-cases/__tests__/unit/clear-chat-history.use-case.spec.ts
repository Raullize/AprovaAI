import { ClearChatHistoryUseCase } from '../../clear-chat-history.use-case';
import { InMemoryAiChatMessageRepository } from '../../../../../../test/repositories/in-memory-ai-chat-message.repository';
import { AiChatMessage } from '../../../../../domain/ai/entities/ai-chat-message.entity';

describe('ClearChatHistoryUseCase', () => {
  let messageRepository: InMemoryAiChatMessageRepository;

  beforeEach(() => {
    messageRepository = new InMemoryAiChatMessageRepository();
  });

  it('should delete only the global messages of the given user', async () => {
    await messageRepository.create(
      AiChatMessage.create({
        userId: 'user-1',
        role: 'USER',
        content: 'global do usuário 1',
      }),
    );
    await messageRepository.create(
      AiChatMessage.create({
        userId: 'user-1',
        simulationAttemptId: 'attempt-1',
        role: 'USER',
        content: 'mensagem de tentativa',
      }),
    );
    await messageRepository.create(
      AiChatMessage.create({
        userId: 'user-2',
        role: 'USER',
        content: 'global do usuário 2',
      }),
    );

    const sut = new ClearChatHistoryUseCase(messageRepository);
    const result = await sut.execute({ userId: 'user-1' });

    expect(result.message).toContain('apagado');
    expect(messageRepository.items).toHaveLength(2);
    expect(
      messageRepository.items.some(
        (item) => item.content === 'global do usuário 1',
      ),
    ).toBe(false);
    expect(
      messageRepository.items.some(
        (item) => item.content === 'mensagem de tentativa',
      ),
    ).toBe(true);
    expect(
      messageRepository.items.some(
        (item) => item.content === 'global do usuário 2',
      ),
    ).toBe(true);
  });
});
