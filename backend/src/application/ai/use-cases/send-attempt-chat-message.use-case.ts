import { Injectable, Logger } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { AiChatMessageRepository } from '../../../domain/ai/repositories/ai-chat-message.repository';
import { AiChatMessage } from '../../../domain/ai/entities/ai-chat-message.entity';
import { ExamRepository } from '../../../domain/content/repositories/exam.repository';
import { QuestionRepository } from '../../../domain/content/repositories/question.repository';
import { SimulationAttemptRepository } from '../../../domain/simulations/repositories/simulation-attempt.repository';
import { SimulationAttempt } from '../../../domain/simulations/entities/simulation-attempt.entity';
import { Question } from '../../../domain/content/entities/question.entity';
import { getCompletedAttemptForUser } from '../attempt-access';
import { loadPublishedChatCatalog } from '../chat-catalog';
import { LlmMessage, LlmProvider } from '../ports/llm-provider';
import {
  AttemptContext,
  AttemptContextQuestion,
  buildAttemptContextSection,
} from '../prompts/attempt-context.prompt';
import { buildSystemPrompt } from '../prompts/chat.prompt';

export interface SendAttemptChatMessageRequest {
  userId: string;
  simulationAttemptId: string;
  message: string;
}

export interface SendAttemptChatMessageResponse {
  reply: string;
}

const HISTORY_LIMIT = 10;

const FALLBACK_REPLY =
  'Não consegui responder agora. Tente novamente em instantes.';

@Injectable()
export class SendAttemptChatMessageUseCase implements UseCase<
  SendAttemptChatMessageRequest,
  SendAttemptChatMessageResponse
> {
  private readonly logger = new Logger(SendAttemptChatMessageUseCase.name);

  constructor(
    private readonly messageRepository: AiChatMessageRepository,
    private readonly simulationAttemptRepository: SimulationAttemptRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly examRepository: ExamRepository,
    private readonly llmProvider: LlmProvider,
  ) {}

  async execute(
    request: SendAttemptChatMessageRequest,
  ): Promise<SendAttemptChatMessageResponse> {
    const message = request.message.trim();
    const attempt = await getCompletedAttemptForUser(
      this.simulationAttemptRepository,
      request.userId,
      request.simulationAttemptId,
    );

    const questions = await this.questionRepository.findBySimulationId(
      attempt.simulationId,
    );
    const history =
      await this.messageRepository.findRecentBySimulationAttemptId(
        request.simulationAttemptId,
        request.userId,
        HISTORY_LIMIT,
      );
    const catalog = await loadPublishedChatCatalog(
      this.examRepository,
      this.logger,
    );

    await this.messageRepository.create(
      AiChatMessage.create({
        userId: request.userId,
        simulationAttemptId: request.simulationAttemptId,
        role: 'USER',
        content: message,
      }),
    );

    let reply: string;

    try {
      const result = await this.llmProvider.generate({
        system: `${buildSystemPrompt(catalog)}${buildAttemptContextSection(
          this.buildContext(attempt, questions),
        )}`,
        messages: this.buildConversation(history, message),
      });
      reply = result.text.trim() || FALLBACK_REPLY;
    } catch (error) {
      this.logger.error(
        'Falha ao gerar resposta contextual do Professor Sabichão',
        error instanceof Error ? error.stack : undefined,
      );
      reply = FALLBACK_REPLY;
    }

    await this.messageRepository.create(
      AiChatMessage.create({
        userId: request.userId,
        simulationAttemptId: request.simulationAttemptId,
        role: 'ASSISTANT',
        content: reply,
      }),
    );

    return { reply };
  }

  private buildContext(
    attempt: SimulationAttempt,
    questions: Question[],
  ): AttemptContext {
    const orderedQuestions = [...questions].sort((a, b) => a.order - b.order);
    const answersByQuestionId = new Map(
      attempt.answers.map((answer) => [answer.questionId, answer]),
    );

    const contextQuestions: AttemptContextQuestion[] = [];

    orderedQuestions.forEach((question, index) => {
      const answer = answersByQuestionId.get(question.id);
      if (!answer) {
        return;
      }

      const optionTextById = new Map(
        question.options.map((option) => [option.id, option.text]),
      );

      contextQuestions.push({
        number: index + 1,
        content: question.content,
        selectedOptions: answer.selectedOptions
          .map((optionId) => optionTextById.get(optionId))
          .filter((text): text is string => Boolean(text)),
        correctOptions: question.options
          .filter((option) => option.isCorrect)
          .map((option) => option.text),
        isCorrect: answer.isCorrect ?? null,
        explanation: question.explanation,
        studyLink: question.studyLink,
      });
    });

    return {
      simulationName: attempt.simulation?.name ?? 'Simulado',
      examName: attempt.simulation?.topic?.exam?.name,
      topicName: attempt.simulation?.topic?.name,
      mode: attempt.mode,
      score:
        attempt.score ??
        attempt.answers.filter((answer) => answer.isCorrect).length,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      passed: attempt.passed,
      stars: attempt.stars,
      timeSpentSeconds: attempt.timeSpent,
      questions: contextQuestions,
    };
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
}
