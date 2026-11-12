import { z } from 'zod';
import {
  GenerateExplanationsInput,
  GenerateQuestionsInput,
  GeneratedQuestion,
  QuestionGenerator,
} from '../../application/content/ports/question-generator';
import { LlmProvider } from '../../application/ai/ports/llm-provider';
import { ValidationError } from '../../shared/core/errors/validation.error';

export interface GeminiQuestionGeneratorOptions {
  llmProvider: LlmProvider;
  modelName: string;
}

const questionOptionSchema = z.object({
  text: z.string().trim().min(1),
  isCorrect: z.boolean(),
});

const generatedQuestionSchema = z.object({
  content: z.string().trim().min(10),
  options: z.array(questionOptionSchema).min(2).max(5),
  explanation: z.string().trim().min(5),
});

const generatedQuestionsSchema = z.object({
  questions: z.array(generatedQuestionSchema).min(1),
});

const generatedExplanationsSchema = z.object({
  explanations: z.array(z.string().trim().min(5)),
});

const GENERATION_SYSTEM_PROMPT = `Você é um professor especialista em elaborar questões de múltipla escolha para o AprovaAI.

Regras:
- Escreva em português do Brasil.
- Cada questão deve ter enunciado autossuficiente, claro e sem ambiguidades.
- Use exatamente 5 alternativas por questão, com exatamente uma correta.
- Inclua uma explicação didática da resposta correta.
- Não use imagens, links, tabelas ou Markdown.
- Responda APENAS com JSON válido, sem texto adicional, no formato:
{"questions":[{"content":"enunciado","options":[{"text":"alternativa","isCorrect":true}],"explanation":"explicação"}]}`;

const EXPLANATION_SYSTEM_PROMPT = `Você é um professor do AprovaAI.
Explique de forma didática, em português do Brasil, por que a alternativa correta
de cada questão está certa e por que as demais não estão.
Não use Markdown, imagens ou links. Responda APENAS com JSON válido no formato:
{"explanations":["explicação da questão 1","explicação da questão 2"]}`;

export class GeminiQuestionGenerator extends QuestionGenerator {
  readonly modelName: string;

  constructor(private readonly options: GeminiQuestionGeneratorOptions) {
    super();
    this.modelName = options.modelName;
  }

  async generateQuestions(
    input: GenerateQuestionsInput,
  ): Promise<GeneratedQuestion[]> {
    const userPrompt = [
      `Gere exatamente ${input.count} questões para o tópico "${input.topicName}" do exame "${input.examName}".`,
      input.focus ? `Foque especialmente em: ${input.focus}.` : '',
      `Lembre-se: 5 alternativas por questão, exatamente uma correta, e explicação.`,
    ]
      .filter(Boolean)
      .join('\n');

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const result = await this.options.llmProvider.generate({
          system: GENERATION_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
          maxOutputTokens: 4096,
        });

        const parsed = generatedQuestionsSchema.parse(parseJson(result.text));

        return parsed.questions.slice(0, input.count).map((question) => {
          const correctOptions = question.options.filter(
            (option) => option.isCorrect,
          );

          if (correctOptions.length !== 1) {
            throw new ValidationError(
              'A IA retornou uma questão sem exatamente uma alternativa correta.',
            );
          }

          return {
            content: question.content,
            options: question.options,
            explanation: question.explanation,
          };
        });
      } catch {
        if (attempt === 1) {
          throw new ValidationError(
            'A IA não retornou questões em formato válido. Tente novamente.',
          );
        }
      }
    }

    throw new ValidationError(
      'A IA não retornou questões em formato válido. Tente novamente.',
    );
  }

  async generateExplanations(
    input: GenerateExplanationsInput,
  ): Promise<Array<string | null>> {
    if (input.questions.length === 0) {
      return [];
    }

    const questionsText = input.questions
      .map((question, index) => {
        const alternatives = question.options
          .map(
            (option) =>
              `- ${option.text}${option.isCorrect ? ' (correta)' : ''}`,
          )
          .join('\n');

        return `Questão ${index + 1}:\n${question.content}\nAlternativas:\n${alternatives}`;
      })
      .join('\n\n');

    try {
      const result = await this.options.llmProvider.generate({
        system: EXPLANATION_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Explique as questões abaixo, na mesma ordem:\n\n${questionsText}`,
          },
        ],
        maxOutputTokens: 4096,
      });

      const parsed = generatedExplanationsSchema.parse(parseJson(result.text));

      if (parsed.explanations.length < input.questions.length) {
        return input.questions.map(
          (_, index) => parsed.explanations[index] ?? null,
        );
      }

      return parsed.explanations.slice(0, input.questions.length);
    } catch {
      return input.questions.map(() => null);
    }
  }
}

function parseJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start < 0 || end <= start) {
    throw new Error('Resposta da IA não contém JSON');
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}
