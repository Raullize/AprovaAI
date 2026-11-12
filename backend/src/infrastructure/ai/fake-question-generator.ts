import {
  GenerateExplanationsInput,
  GenerateQuestionsInput,
  GeneratedQuestion,
  QuestionGenerator,
} from '../../application/content/ports/question-generator';

export class FakeQuestionGenerator extends QuestionGenerator {
  readonly modelName = 'fake-ai';

  generateQuestions(
    input: GenerateQuestionsInput,
  ): Promise<GeneratedQuestion[]> {
    return Promise.resolve(
      Array.from({ length: input.count }, (_, index) => ({
        content: `Questão ${index + 1} sobre ${input.topicName} (fake AI)`,
        options: [
          { text: 'Alternativa A', isCorrect: false },
          { text: 'Alternativa B', isCorrect: true },
          { text: 'Alternativa C', isCorrect: false },
          { text: 'Alternativa D', isCorrect: false },
          { text: 'Alternativa E', isCorrect: false },
        ],
        explanation: `Explicação da questão ${index + 1} sobre ${input.topicName}.`,
      })),
    );
  }

  generateExplanations(
    input: GenerateExplanationsInput,
  ): Promise<Array<string | null>> {
    return Promise.resolve(
      input.questions.map(
        (_, index) => `Explicação gerada para a questão ${index + 1}.`,
      ),
    );
  }
}
