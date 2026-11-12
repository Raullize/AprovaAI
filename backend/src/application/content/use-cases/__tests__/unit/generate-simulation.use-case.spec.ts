import { GenerateSimulationUseCase } from '../../generate-simulation.use-case';
import {
  EnemQuestion,
  EnemQuestionBank,
} from '../../../ports/enem-question-bank';
import {
  GenerateExplanationsInput,
  GeneratedQuestion,
  QuestionGenerator,
} from '../../../ports/question-generator';
import { InMemoryContentGenerationRepository } from '../../../../../../test/repositories/in-memory-content-generation.repository';
import { InMemoryExamRepository } from '../../../../../../test/repositories/in-memory-exam.repository';
import { InMemoryQuestionRepository } from '../../../../../../test/repositories/in-memory-question.repository';
import { InMemorySimulationRepository } from '../../../../../../test/repositories/in-memory-simulation.repository';
import { InMemoryTopicRepository } from '../../../../../../test/repositories/in-memory-topic.repository';
import { Exam } from '../../../../../domain/content/entities/exam.entity';
import { Topic } from '../../../../../domain/content/entities/topic.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';
import { ValidationError } from '../../../../../shared/core/errors/validation.error';
import { FakeEnemQuestionBank } from '../../../../../infrastructure/enem/fake-enem-question-bank';
import { FakeQuestionGenerator } from '../../../../../infrastructure/ai/fake-question-generator';

class EmptyEnemQuestionBank extends EnemQuestionBank {
  fetchQuestions(): Promise<EnemQuestion[]> {
    return Promise.resolve([]);
  }
}

class InvalidOptionQuestionGenerator extends QuestionGenerator {
  readonly modelName = 'invalid-ai';

  generateQuestions(): Promise<GeneratedQuestion[]> {
    return Promise.resolve([
      {
        content: 'Questão inválida com duas corretas.',
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: true },
          { text: 'C', isCorrect: false },
        ],
        explanation: 'Explicação.',
      },
    ]);
  }

  generateExplanations(
    input: GenerateExplanationsInput,
  ): Promise<Array<string | null>> {
    return Promise.resolve(input.questions.map(() => null));
  }

  selectRelevantQuestions(): Promise<number[]> {
    return Promise.resolve([1]);
  }
}

class SelectingQuestionGenerator extends FakeQuestionGenerator {
  selectRelevantQuestions(): Promise<number[]> {
    return Promise.resolve([2, 3]);
  }
}

class EmptySelectionQuestionGenerator extends FakeQuestionGenerator {
  selectRelevantQuestions(): Promise<number[]> {
    return Promise.resolve([]);
  }
}

describe('GenerateSimulationUseCase', () => {
  let topicRepository: InMemoryTopicRepository;
  let examRepository: InMemoryExamRepository;
  let simulationRepository: InMemorySimulationRepository;
  let questionRepository: InMemoryQuestionRepository;
  let contentGenerationRepository: InMemoryContentGenerationRepository;
  let topic: Topic;

  beforeEach(async () => {
    topicRepository = new InMemoryTopicRepository();
    examRepository = new InMemoryExamRepository();
    simulationRepository = new InMemorySimulationRepository();
    questionRepository = new InMemoryQuestionRepository();
    contentGenerationRepository = new InMemoryContentGenerationRepository(
      simulationRepository,
      questionRepository,
    );

    const exam = Exam.create({
      name: 'ENEM',
      slug: Slug.create('enem'),
      status: 'PUBLISHED',
      category: 'VESTIBULARES',
    });
    await examRepository.create(exam);

    topic = Topic.create({
      name: 'Matemática e suas Tecnologias',
      slug: Slug.create('matematica-e-suas-tecnologias'),
      examId: exam.id,
      status: 'PUBLISHED',
    });
    await topicRepository.create(topic);
  });

  function buildSut(
    enemQuestionBank: EnemQuestionBank = new FakeEnemQuestionBank(),
    questionGenerator: QuestionGenerator = new FakeQuestionGenerator(),
  ) {
    return new GenerateSimulationUseCase(
      topicRepository,
      examRepository,
      simulationRepository,
      contentGenerationRepository,
      enemQuestionBank,
      questionGenerator,
    );
  }

  it('should generate a draft simulation with ENEM questions', async () => {
    const sut = buildSut();

    const simulation = await sut.execute({
      topicId: topic.id,
      source: 'ENEM',
      count: 5,
      enem: { discipline: 'matematica', years: [2023] },
    });

    expect(simulation.status).toBe('DRAFT');
    expect(simulation.source).toBe('ENEM');
    expect(simulation.name).toContain('ENEM 2023');
    expect(simulation.topicId).toBe(topic.id);
    expect(simulationRepository.items).toHaveLength(1);

    const questions = [...questionRepository.items].sort(
      (a, b) => a.order - b.order,
    );
    expect(questions).toHaveLength(5);
    expect(questions.every((question) => question.status === 'DRAFT')).toBe(
      true,
    );
    expect(questions.every((question) => question.source === 'ENEM')).toBe(
      true,
    );
    expect(questions.every((question) => question.sourceRef)).toBe(true);
    expect(
      questions.every(
        (question) =>
          question.options.filter((option) => option.isCorrect).length === 1,
      ),
    ).toBe(true);
    expect(
      questions.every(
        (question) => question.explanation?.includes('Explicação') === true,
      ),
    ).toBe(true);
    expect(
      questions.every((question) => question.simulationId === simulation.id),
    ).toBe(true);
  });

  it('should generate a draft simulation with AI questions', async () => {
    const sut = buildSut();

    const simulation = await sut.execute({
      topicId: topic.id,
      source: 'AI',
      count: 3,
      ai: { focus: 'funções quadráticas' },
    });

    expect(simulation.status).toBe('DRAFT');
    expect(simulation.source).toBe('AI');

    const questions = [...questionRepository.items];
    expect(questions).toHaveLength(3);
    expect(questions.every((question) => question.source === 'AI')).toBe(true);
    expect(questions.every((question) => question.aiModel === 'fake-ai')).toBe(
      true,
    );
    expect(questions.every((question) => !question.sourceRef)).toBe(true);
  });

  it('should reject a topic that does not exist', async () => {
    const sut = buildSut();

    await expect(
      sut.execute({
        topicId: '00000000-0000-0000-0000-000000000000',
        source: 'AI',
        count: 3,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should reject an invalid question count', async () => {
    const sut = buildSut();

    await expect(
      sut.execute({ topicId: topic.id, source: 'AI', count: 11 }),
    ).rejects.toBeInstanceOf(ValidationError);

    await expect(
      sut.execute({ topicId: topic.id, source: 'AI', count: 0 }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should require ENEM filters when the source is ENEM', async () => {
    const sut = buildSut();

    await expect(
      sut.execute({ topicId: topic.id, source: 'ENEM', count: 3 }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should reject when the ENEM bank returns no questions', async () => {
    const sut = buildSut(new EmptyEnemQuestionBank());

    await expect(
      sut.execute({
        topicId: topic.id,
        source: 'ENEM',
        count: 3,
        enem: { discipline: 'matematica', years: [2023] },
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should keep only the questions selected by the AI curator', async () => {
    const sut = buildSut(
      new FakeEnemQuestionBank(),
      new SelectingQuestionGenerator(),
    );

    await sut.execute({
      topicId: topic.id,
      source: 'ENEM',
      count: 3,
      enem: { discipline: 'matematica', years: [2023] },
    });

    const questions = [...questionRepository.items];
    expect(questions).toHaveLength(2);
    expect(questions[0].content).toContain('Questão 2');
    expect(questions[1].content).toContain('Questão 3');
  });

  it('should reject when the AI curator selects no questions', async () => {
    const sut = buildSut(
      new FakeEnemQuestionBank(),
      new EmptySelectionQuestionGenerator(),
    );

    await expect(
      sut.execute({
        topicId: topic.id,
        source: 'ENEM',
        count: 3,
        enem: { discipline: 'matematica', years: [2023] },
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should reject AI questions without exactly one correct option', async () => {
    const sut = buildSut(
      new FakeEnemQuestionBank(),
      new InvalidOptionQuestionGenerator(),
    );

    await expect(
      sut.execute({ topicId: topic.id, source: 'AI', count: 1 }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
