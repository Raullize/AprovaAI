export interface GenerateQuestionsInput {
  topicName: string;
  examName: string;
  count: number;
  focus?: string;
}

export interface GeneratedQuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface GeneratedQuestion {
  content: string;
  options: GeneratedQuestionOption[];
  explanation: string;
}

export interface GenerateExplanationsInput {
  topicName: string;
  examName: string;
  questions: Array<{
    content: string;
    options: GeneratedQuestionOption[];
  }>;
}

export interface SelectRelevantQuestionsInput {
  topicName: string;
  examName: string;
  disciplineLabel: string;
  limit: number;
  questions: Array<{
    index: number;
    content: string;
  }>;
}

export abstract class QuestionGenerator {
  abstract readonly modelName: string;

  abstract generateQuestions(
    input: GenerateQuestionsInput,
  ): Promise<GeneratedQuestion[]>;

  abstract generateExplanations(
    input: GenerateExplanationsInput,
  ): Promise<Array<string | null>>;

  abstract selectRelevantQuestions(
    input: SelectRelevantQuestionsInput,
  ): Promise<number[]>;
}
