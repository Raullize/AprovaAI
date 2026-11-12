export type LlmRole = 'user' | 'assistant';

export interface LlmMessage {
  role: LlmRole;
  content: string;
}

export interface LlmGenerateRequest {
  system: string;
  messages: LlmMessage[];
  maxOutputTokens?: number;
}

export interface LlmGenerateResult {
  text: string;
}

export abstract class LlmProvider {
  abstract generate(request: LlmGenerateRequest): Promise<LlmGenerateResult>;
}
