import { GeminiQuestionGenerator } from '../../gemini-question-generator';
import {
  LlmGenerateRequest,
  LlmGenerateResult,
  LlmProvider,
} from '../../../../application/ai/ports/llm-provider';
import { ValidationError } from '../../../../shared/core/errors/validation.error';

class ScriptedLlmProvider extends LlmProvider {
  public readonly requests: LlmGenerateRequest[] = [];
  private index = 0;

  constructor(private readonly responses: string[]) {
    super();
  }

  generate(request: LlmGenerateRequest): Promise<LlmGenerateResult> {
    this.requests.push(request);
    const response = this.responses[this.index] ?? this.responses.at(-1) ?? '';
    this.index += 1;
    return Promise.resolve({ text: response });
  }
}

describe('GeminiQuestionGenerator', () => {
  it('should parse questions from a fenced JSON response', async () => {
    const provider = new ScriptedLlmProvider([
      '```json\n{"questions":[{"content":"Qual é a capital do Brasil?","options":[{"text":"Brasília","isCorrect":true},{"text":"Rio de Janeiro","isCorrect":false},{"text":"São Paulo","isCorrect":false},{"text":"Salvador","isCorrect":false},{"text":"Recife","isCorrect":false}],"explanation":"Brasília é a capital federal."}]}\n```',
    ]);
    const generator = new GeminiQuestionGenerator({
      llmProvider: provider,
      modelName: 'test-model',
    });

    const questions = await generator.generateQuestions({
      topicName: 'Geografia',
      examName: 'ENEM',
      count: 1,
    });

    expect(questions).toHaveLength(1);
    expect(questions[0].content).toContain('capital do Brasil');
    expect(
      questions[0].options.filter((option) => option.isCorrect),
    ).toHaveLength(1);
    expect(provider.requests[0].maxOutputTokens).toBe(4096);
    expect(provider.requests[0].messages[0].content).toContain('Geografia');
  });

  it('should retry once when the AI returns invalid JSON', async () => {
    const provider = new ScriptedLlmProvider(['não é json', 'também não']);
    const generator = new GeminiQuestionGenerator({
      llmProvider: provider,
      modelName: 'test-model',
    });

    await expect(
      generator.generateQuestions({
        topicName: 'Geografia',
        examName: 'ENEM',
        count: 1,
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(provider.requests).toHaveLength(2);
  });

  it('should reject questions without exactly one correct option', async () => {
    const provider = new ScriptedLlmProvider([
      '{"questions":[{"content":"Questão com duas corretas.","options":[{"text":"A","isCorrect":true},{"text":"B","isCorrect":true},{"text":"C","isCorrect":false}],"explanation":"Explicação."}]}',
      '{"questions":[]}',
    ]);
    const generator = new GeminiQuestionGenerator({
      llmProvider: provider,
      modelName: 'test-model',
    });

    await expect(
      generator.generateQuestions({
        topicName: 'Geografia',
        examName: 'ENEM',
        count: 1,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should return null explanations when the AI response is invalid', async () => {
    const provider = new ScriptedLlmProvider(['not json']);
    const generator = new GeminiQuestionGenerator({
      llmProvider: provider,
      modelName: 'test-model',
    });

    const explanations = await generator.generateExplanations({
      topicName: 'Geografia',
      examName: 'ENEM',
      questions: [
        {
          content: 'Questão 1',
          options: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
          ],
        },
        {
          content: 'Questão 2',
          options: [
            { text: 'A', isCorrect: false },
            { text: 'B', isCorrect: true },
          ],
        },
      ],
    });

    expect(explanations).toEqual([null, null]);
  });
});
