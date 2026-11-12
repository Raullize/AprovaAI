import { SendAttemptChatMessageUseCase } from '../../send-attempt-chat-message.use-case';
import {
  LlmGenerateRequest,
  LlmGenerateResult,
  LlmProvider,
} from '../../../ports/llm-provider';
import { InMemoryAiChatMessageRepository } from '../../../../../../test/repositories/in-memory-ai-chat-message.repository';
import { InMemoryExamRepository } from '../../../../../../test/repositories/in-memory-exam.repository';
import { InMemoryQuestionRepository } from '../../../../../../test/repositories/in-memory-question.repository';
import { InMemorySimulationAttemptRepository } from '../../../../../../test/repositories/in-memory-simulation-attempt.repository';
import { AiChatMessage } from '../../../../../domain/ai/entities/ai-chat-message.entity';
import { Question } from '../../../../../domain/content/entities/question.entity';
import {
  AttemptAnswer,
  SimulationAttempt,
} from '../../../../../domain/simulations/entities/simulation-attempt.entity';
import { ConflictError } from '../../../../../shared/core/errors/conflict.error';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

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

function buildAttempt(
  overrides: Partial<Parameters<typeof SimulationAttempt.create>[0]> = {},
): SimulationAttempt {
  return SimulationAttempt.create(
    {
      userId: 'user-1',
      simulationId: 'simulation-1',
      status: 'COMPLETED',
      mode: 'PRACTICE',
      score: 1,
      totalQuestions: 2,
      percentage: 50,
      passed: false,
      stars: 1,
      timeSpent: 125,
      simulation: {
        name: 'Simulado ENEM',
        topic: {
          name: 'Matemática',
          exam: { name: 'ENEM' },
        },
      },
      answers: [
        AttemptAnswer.create({
          simulationAttemptId: 'attempt-1',
          questionId: 'question-1',
          selectedOptions: ['option-1b'],
          isCorrect: false,
          timeSpent: 40,
        }),
        AttemptAnswer.create({
          simulationAttemptId: 'attempt-1',
          questionId: 'question-2',
          selectedOptions: ['option-2a'],
          isCorrect: true,
          timeSpent: 30,
        }),
      ],
      ...overrides,
    },
    'attempt-1',
  );
}

function buildQuestion(
  id: string,
  order: number,
  overrides: Partial<Parameters<typeof Question.create>[0]> = {},
): Question {
  return Question.create(
    {
      content: `Questão ${order} sobre o conteúdo`,
      order,
      simulationId: 'simulation-1',
      explanation: `Explicação da questão ${order}`,
      studyLink: `https://study.test/${id}`,
      options: [
        {
          id: `option-${order}a`,
          text: `Alternativa correta ${order}`,
          isCorrect: true,
          order: 1,
        },
        {
          id: `option-${order}b`,
          text: `Alternativa errada ${order}`,
          isCorrect: false,
          order: 2,
        },
      ],
      ...overrides,
    },
    id,
  );
}

describe('SendAttemptChatMessageUseCase', () => {
  let messageRepository: InMemoryAiChatMessageRepository;
  let attemptRepository: InMemorySimulationAttemptRepository;
  let questionRepository: InMemoryQuestionRepository;
  let examRepository: InMemoryExamRepository;

  beforeEach(() => {
    messageRepository = new InMemoryAiChatMessageRepository();
    attemptRepository = new InMemorySimulationAttemptRepository();
    questionRepository = new InMemoryQuestionRepository();
    examRepository = new InMemoryExamRepository();
  });

  function buildSut(provider: LlmProvider) {
    return new SendAttemptChatMessageUseCase(
      messageRepository,
      attemptRepository,
      questionRepository,
      examRepository,
      provider,
    );
  }

  it('should send the attempt context and persist the conversation scoped to the attempt', async () => {
    await attemptRepository.create(buildAttempt());
    await questionRepository.create(buildQuestion('question-1', 1));
    await questionRepository.create(buildQuestion('question-2', 2));

    const provider = new RecordingLlmProvider(
      'Você errou por confundir os conceitos.',
    );
    const sut = buildSut(provider);

    const result = await sut.execute({
      userId: 'user-1',
      simulationAttemptId: 'attempt-1',
      message: 'Por que errei a questão 1?',
    });

    expect(result.reply).toBe('Você errou por confundir os conceitos.');
    expect(messageRepository.items).toHaveLength(2);
    expect(messageRepository.items[0].role).toBe('USER');
    expect(messageRepository.items[0].simulationAttemptId).toBe('attempt-1');
    expect(messageRepository.items[0].content).toBe(
      'Por que errei a questão 1?',
    );
    expect(messageRepository.items[1].role).toBe('ASSISTANT');
    expect(messageRepository.items[1].simulationAttemptId).toBe('attempt-1');

    const request = provider.lastRequest as LlmGenerateRequest;
    expect(request.system).toContain('Contexto desta tentativa');
    expect(request.system).toContain('Simulado ENEM');
    expect(request.system).toContain('Exame: ENEM');
    expect(request.system).toContain('Tópico: Matemática');
    expect(request.system).toContain('1 de 2 acertos (50%)');
    expect(request.system).toContain('[ERROU] Questão 1 sobre o conteúdo');
    expect(request.system).toContain('Alternativa errada 1');
    expect(request.system).toContain('Alternativa correta 1');
    expect(request.messages).toEqual([
      { role: 'user', content: 'Por que errei a questão 1?' },
    ]);
  });

  it('should not mix the global chat history with the attempt history', async () => {
    await attemptRepository.create(buildAttempt());
    await questionRepository.create(buildQuestion('question-1', 1));
    await questionRepository.create(buildQuestion('question-2', 2));

    await messageRepository.create(
      AiChatMessage.create({
        userId: 'user-1',
        role: 'USER',
        content: 'mensagem do chat global',
      }),
    );
    await messageRepository.create(
      AiChatMessage.create({
        userId: 'user-1',
        simulationAttemptId: 'attempt-1',
        role: 'USER',
        content: 'mensagem anterior da tentativa',
      }),
    );
    await messageRepository.create(
      AiChatMessage.create({
        userId: 'user-1',
        simulationAttemptId: 'attempt-1',
        role: 'ASSISTANT',
        content: 'resposta anterior da tentativa',
      }),
    );

    const provider = new RecordingLlmProvider();
    const sut = buildSut(provider);

    await sut.execute({
      userId: 'user-1',
      simulationAttemptId: 'attempt-1',
      message: 'nova dúvida',
    });

    const request = provider.lastRequest as LlmGenerateRequest;
    expect(request.messages).toEqual([
      { role: 'user', content: 'mensagem anterior da tentativa' },
      { role: 'assistant', content: 'resposta anterior da tentativa' },
      { role: 'user', content: 'nova dúvida' },
    ]);
  });

  it('should reject attempts that belong to another user', async () => {
    await attemptRepository.create(buildAttempt({ userId: 'user-2' }));
    const sut = buildSut(new RecordingLlmProvider());

    await expect(
      sut.execute({
        userId: 'user-1',
        simulationAttemptId: 'attempt-1',
        message: 'Olá',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should reject attempts that are not completed', async () => {
    await attemptRepository.create(buildAttempt({ status: 'IN_PROGRESS' }));
    const sut = buildSut(new RecordingLlmProvider());

    await expect(
      sut.execute({
        userId: 'user-1',
        simulationAttemptId: 'attempt-1',
        message: 'Olá',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('should persist a friendly fallback reply when the provider fails', async () => {
    await attemptRepository.create(buildAttempt());
    await questionRepository.create(buildQuestion('question-1', 1));
    await questionRepository.create(buildQuestion('question-2', 2));

    const sut = buildSut(new FailingLlmProvider());

    const result = await sut.execute({
      userId: 'user-1',
      simulationAttemptId: 'attempt-1',
      message: 'Olá',
    });

    expect(result.reply).toContain('Não consegui responder agora');
    expect(messageRepository.items).toHaveLength(2);
    expect(messageRepository.items[1].role).toBe('ASSISTANT');
    expect(messageRepository.items[1].content).toBe(result.reply);
    expect(messageRepository.items[1].simulationAttemptId).toBe('attempt-1');
  });
});
