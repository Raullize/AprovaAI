import {
  LlmGenerateRequest,
  LlmGenerateResult,
  LlmProvider,
} from '../../application/ai/ports/llm-provider';

export interface GeminiLlmProviderOptions {
  apiKey: string;
  model: string;
  maxOutputTokens: number;
  timeoutMs?: number;
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string; thought?: boolean }[];
    };
  }[];
}

export class GeminiLlmProvider extends LlmProvider {
  constructor(private readonly options: GeminiLlmProviderOptions) {
    super();
  }

  async generate(request: LlmGenerateRequest): Promise<LlmGenerateResult> {
    const url =
      'https://generativelanguage.googleapis.com/v1beta/models/' +
      `${encodeURIComponent(this.options.model)}:generateContent` +
      `?key=${encodeURIComponent(this.options.apiKey)}`;

    const body = {
      systemInstruction: { parts: [{ text: request.system }] },
      contents: request.messages.map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      })),
      generationConfig: {
        maxOutputTokens:
          request.maxOutputTokens ?? this.options.maxOutputTokens,
        temperature: 0.6,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.options.timeoutMs ?? 30000),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Gemini API respondeu ${response.status}: ${details.slice(0, 300)}`,
      );
    }

    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts
      ?.filter((part) => part.thought !== true)
      .map((part) => part.text)
      .filter((part): part is string => Boolean(part))
      .join('\n')
      .trim();

    if (!text) {
      throw new Error('Gemini retornou uma resposta vazia');
    }

    return { text };
  }
}
