import { SendChatMessageUseCase } from '../../send-chat-message.use-case';
import {
  LlmGenerateRequest,
  LlmGenerateResult,
  LlmProvider,
} from '../../../ports/llm-provider';
import { InMemoryAiChatMessageRepository } from '../../../../../../test/repositories/in-memory-ai-chat-message.repository';
import { InMemoryExamRepository } from '../../../../../../test/repositories/in-memory-exam.repository';
import { AiChatMessage } from '../../../../../domain/ai/entities/ai-chat-message.entity';
import { Exam } from '../../../../../domain/content/entities/exam.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';

class RecordingLlmProvider extends LlmProvider {
  public lastRequest: LlmGenerateRequest | null = null;

  constructor(private readonly reply = 'Resposta de teste') {
    super();
  }

  generate(request: LlmGenerateRequest): Promise<LlmGenerateResult> {
    this.lastRequest = request;
    return Promise.resolve({ text: this.reply });
  }
}

class FailingLlmProvider extends LlmProvider {
  generate(): Promise<LlmGenerateResult> {
    return Promise.reject(new Error('provider failure'));
  }
}

describe('SendChatMessageUseCase', () => {
  let messageRepository: InMemoryAiChatMessageRepository;
  let examRepository: InMemoryExamRepository;

  beforeEach(() => {
    messageRepository = new InMemoryAiChatMessageRepository();
    examRepository = new InMemoryExamRepository();
  });

  it('should persist the user message and the assistant reply', async () => {
    const provider = new RecordingLlmProvider('Olá, estudante!');
    const sut = new SendChatMessageUseCase(
      messageRepository,
      examRepository,
      provider,
    );

    const result = await sut.execute({
      userId: 'user-1',
      message: 'Como funciona o XP?',
    });

    expect(result.reply).toBe('Olá, estudante!');
    expect(messageRepository.items).toHaveLength(2);
    expect(messageRepository.items[0].role).toBe('USER');
    expect(messageRepository.items[0].content).toBe('Como funciona o XP?');
    expect(messageRepository.items[1].role).toBe('ASSISTANT');
    expect(messageRepository.items[1].content).toBe('Olá, estudante!');
  });

  it('should send the conversation history and the platform prompt to the provider', async () => {
    await messageRepository.create(
      AiChatMessage.create({
        userId: 'user-1',
        role: 'USER',
        content: 'pergunta anterior',
      }),
    );
    await messageRepository.create(
      AiChatMessage.create({
        userId: 'user-1',
        role: 'ASSISTANT',
        content: 'resposta anterior',
      }),
    );

    await examRepository.create(
      Exam.create({
        name: 'ENEM',
        slug: Slug.create('enem'),
        status: 'PUBLISHED',
        category: 'CONCURSOS',
      }),
    );

    const provider = new RecordingLlmProvider();
    const sut = new SendChatMessageUseCase(
      messageRepository,
      examRepository,
      provider,
    );

    await sut.execute({ userId: 'user-1', message: 'nova pergunta' });

    expect(provider.lastRequest).not.toBeNull();
    const request = provider.lastRequest as LlmGenerateRequest;

    expect(request.messages).toHaveLength(3);
    expect(request.messages[0]).toEqual({
      role: 'user',
      content: 'pergunta anterior',
    });
    expect(request.messages[1]).toEqual({
      role: 'assistant',
      content: 'resposta anterior',
    });
    expect(request.messages[2]).toEqual({
      role: 'user',
      content: 'nova pergunta',
    });

    expect(request.system).toContain('AprovaAI');
    expect(request.system).toContain('administrativo');
    expect(request.system).toContain('ENEM');
  });

  it('should not include another user history', async () => {
    await messageRepository.create(
      AiChatMessage.create({
        userId: 'user-2',
        role: 'USER',
        content: 'mensagem de outro usuário',
      }),
    );

    const provider = new RecordingLlmProvider();
    const sut = new SendChatMessageUseCase(
      messageRepository,
      examRepository,
      provider,
    );

    await sut.execute({ userId: 'user-1', message: 'minha pergunta' });

    const request = provider.lastRequest as LlmGenerateRequest;
    expect(request.messages).toHaveLength(1);
    expect(request.messages[0].content).toBe('minha pergunta');
  });

  it('should persist a friendly fallback reply when the provider fails', async () => {
    const sut = new SendChatMessageUseCase(
      messageRepository,
      examRepository,
      new FailingLlmProvider(),
    );

    const result = await sut.execute({
      userId: 'user-1',
      message: 'Olá',
    });

    expect(result.reply).toContain('Não consegui responder agora');
    expect(messageRepository.items).toHaveLength(2);
    expect(messageRepository.items[1].role).toBe('ASSISTANT');
    expect(messageRepository.items[1].content).toBe(result.reply);
  });
});
