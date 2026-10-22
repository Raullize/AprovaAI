import { Injectable, Logger } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { AiChatMessageRepository } from '../../../domain/ai/repositories/ai-chat-message.repository';
import { AiChatMessage } from '../../../domain/ai/entities/ai-chat-message.entity';
import { ExamRepository } from '../../../domain/content/repositories/exam.repository';
import { LlmMessage, LlmProvider } from '../ports/llm-provider';
import { buildSystemPrompt, ChatCatalog } from '../prompts/chat.prompt';

export interface SendChatMessageRequest {
  userId: string;
  message: string;
}

export interface SendChatMessageResponse {
  reply: string;
}

const HISTORY_LIMIT = 10;

const FALLBACK_REPLY =
  'Não consegui responder agora. Tente novamente em instantes.';

@Injectable()
export class SendChatMessageUseCase implements UseCase<
  SendChatMessageRequest,
  SendChatMessageResponse
> {
  private readonly logger = new Logger(SendChatMessageUseCase.name);

  constructor(
    private readonly messageRepository: AiChatMessageRepository,
    private readonly examRepository: ExamRepository,
    private readonly llmProvider: LlmProvider,
  ) {}

  async execute(
    request: SendChatMessageRequest,
  ): Promise<SendChatMessageResponse> {
    const message = request.message.trim();

    const history = await this.messageRepository.findRecentByUserId(
      request.userId,
      HISTORY_LIMIT,
    );
    const catalog = await this.loadCatalog();

    await this.messageRepository.create(
      AiChatMessage.create({
        userId: request.userId,
        role: 'USER',
        content: message,
      }),
    );

    let reply: string;

    try {
      const result = await this.llmProvider.generate({
        system: buildSystemPrompt(catalog),
        messages: this.buildConversation(history, message),
      });
      reply = result.text.trim() || FALLBACK_REPLY;
    } catch (error) {
      this.logger.error(
        'Falha ao gerar resposta do Professor Sabichão',
        error instanceof Error ? error.stack : undefined,
      );
      reply = FALLBACK_REPLY;
    }

    await this.messageRepository.create(
      AiChatMessage.create({
        userId: request.userId,
        role: 'ASSISTANT',
        content: reply,
      }),
    );

    return { reply };
  }

  private buildConversation(
    history: AiChatMessage[],
    message: string,
  ): LlmMessage[] {
    return [
      ...history.map<LlmMessage>((item) => ({
        role: item.role === 'USER' ? 'user' : 'assistant',
        content: item.content,
      })),
      { role: 'user', content: message },
    ];
  }

  private async loadCatalog(): Promise<ChatCatalog | undefined> {
    try {
      const exams = await this.examRepository.findAll();
      const published = exams.filter((exam) => exam.status === 'PUBLISHED');

      if (published.length === 0) {
        return undefined;
      }

      return {
        exams: published.map((exam) => ({
          name: exam.name,
          category: exam.category,
          topicsCount: exam.topicsCount,
        })),
      };
    } catch (error) {
      this.logger.warn(
        'Não foi possível carregar o catálogo de exames para o chat',
        error instanceof Error ? error.stack : undefined,
      );
      return undefined;
    }
  }
}
