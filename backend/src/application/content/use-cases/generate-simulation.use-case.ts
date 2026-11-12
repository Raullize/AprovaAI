import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { ContentGenerationRepository } from '../../../domain/content/repositories/content-generation.repository';
import { ExamRepository } from '../../../domain/content/repositories/exam.repository';
import { SimulationRepository } from '../../../domain/content/repositories/simulation.repository';
import { TopicRepository } from '../../../domain/content/repositories/topic.repository';
import { Question } from '../../../domain/content/entities/question.entity';
import { Simulation } from '../../../domain/content/entities/simulation.entity';
import { Percentage } from '../../../domain/content/value-objects/percentage';
import { Slug } from '../../../domain/content/value-objects/slug';
import { ValidationError } from '../../../shared/core/errors/validation.error';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';
import { generateUniqueSlug } from '../../../shared/utils/slugify';
import {
  EnemDiscipline,
  EnemLanguage,
  EnemQuestionBank,
} from '../ports/enem-question-bank';
import { QuestionGenerator } from '../ports/question-generator';

export type GenerateSimulationSource = 'ENEM' | 'AI';

export interface GenerateSimulationRequest {
  topicId: string;
  source: GenerateSimulationSource;
  count?: number;
  name?: string;
  description?: string;
  xpReward?: number;
  passingPercentage?: number;
  timeLimit?: number | null;
  simulationMode?: 'PRACTICE' | 'EXAM';
  enem?: {
    discipline: EnemDiscipline;
    years: number[];
    language?: EnemLanguage;
  };
  ai?: {
    focus?: string;
  };
}

const DEFAULT_COUNT = 10;
const MAX_COUNT = 10;
const MIN_YEAR = 2009;
const MAX_YEAR = 2023;
const DEFAULT_XP_REWARD = 100;
const DEFAULT_PASSING_PERCENTAGE = 70;

@Injectable()
export class GenerateSimulationUseCase implements UseCase<
  GenerateSimulationRequest,
  Simulation
> {
  constructor(
    private readonly topicRepository: TopicRepository,
    private readonly examRepository: ExamRepository,
    private readonly simulationRepository: SimulationRepository,
    private readonly contentGenerationRepository: ContentGenerationRepository,
    private readonly enemQuestionBank: EnemQuestionBank,
    private readonly questionGenerator: QuestionGenerator,
  ) {}

  async execute(request: GenerateSimulationRequest): Promise<Simulation> {
    const count = this.resolveCount(request.count);
    const topic = await this.topicRepository.findById(request.topicId);

    if (!topic) {
      throw new ResourceNotFoundError('Topic', request.topicId);
    }

    const exam = await this.examRepository.findById(topic.examId);
    const examName = exam?.name ?? 'AprovaAI';
    const order = await this.simulationRepository.countByTopicId(topic.id);
    const slug = await generateUniqueSlug(
      request.name?.trim() || this.buildDefaultName(request, topic.name),
      async (testSlug) => {
        const existing = await this.simulationRepository.findBySlugAndTopicId(
          testSlug,
          topic.id,
        );
        return !!existing;
      },
    );

    const simulation = Simulation.create({
      name: request.name?.trim() || this.buildDefaultName(request, topic.name),
      slug: Slug.create(slug),
      description:
        request.description?.trim() ||
        this.buildDefaultDescription(request, topic.name),
      status: 'DRAFT',
      source: request.source,
      topicId: topic.id,
      xpReward: request.xpReward ?? DEFAULT_XP_REWARD,
      passingPercentage: Percentage.create(
        request.passingPercentage ?? DEFAULT_PASSING_PERCENTAGE,
      ),
      timeLimit: request.timeLimit ?? null,
      simulationMode: request.simulationMode ?? 'PRACTICE',
      order,
      questionsCount: 0,
    });

    const questions =
      request.source === 'ENEM'
        ? await this.buildEnemQuestions(
            request,
            simulation,
            topic.name,
            examName,
            count,
          )
        : await this.buildAiQuestions(
            request,
            simulation,
            topic.name,
            examName,
            count,
          );

    if (questions.length === 0) {
      throw new ValidationError(
        'Não foi possível gerar questões para este simulado. Tente novamente.',
      );
    }

    return this.contentGenerationRepository.createSimulationWithQuestions(
      simulation,
      questions,
    );
  }

  private resolveCount(count?: number): number {
    const resolved = count ?? DEFAULT_COUNT;
    if (!Number.isInteger(resolved) || resolved < 1 || resolved > MAX_COUNT) {
      throw new ValidationError(
        `A quantidade de questões deve estar entre 1 e ${MAX_COUNT}.`,
      );
    }
    return resolved;
  }

  private validateEnemRequest(
    request: GenerateSimulationRequest,
  ): NonNullable<GenerateSimulationRequest['enem']> {
    if (!request.enem) {
      throw new ValidationError(
        'Disciplina e anos são obrigatórios para gerar a partir do ENEM.',
      );
    }

    const years = [...new Set(request.enem.years)].sort((a, b) => a - b);
    if (
      years.length === 0 ||
      years.some((year) => year < MIN_YEAR || year > MAX_YEAR)
    ) {
      throw new ValidationError(
        `Informe anos entre ${MIN_YEAR} e ${MAX_YEAR} para as questões do ENEM.`,
      );
    }

    return {
      ...request.enem,
      years,
      language:
        request.enem.discipline === 'linguagens'
          ? (request.enem.language ?? 'ingles')
          : undefined,
    };
  }

  private async buildEnemQuestions(
    request: GenerateSimulationRequest,
    simulation: Simulation,
    topicName: string,
    examName: string,
    count: number,
  ): Promise<Question[]> {
    const enem = this.validateEnemRequest(request);
    const candidates = await this.enemQuestionBank.fetchQuestions({
      discipline: enem.discipline,
      years: enem.years,
      language: enem.language,
      limit: count,
    });

    if (candidates.length === 0) {
      return [];
    }

    const explanations = await this.questionGenerator.generateExplanations({
      topicName,
      examName,
      questions: candidates.map((question) => ({
        content: question.content,
        options: question.options,
      })),
    });

    return candidates.map((question, index) =>
      this.toQuestion(
        {
          content: question.content,
          options: question.options,
          explanation: explanations[index],
        },
        simulation.id,
        index,
        'ENEM',
        question.sourceRef,
      ),
    );
  }

  private async buildAiQuestions(
    request: GenerateSimulationRequest,
    simulation: Simulation,
    topicName: string,
    examName: string,
    count: number,
  ): Promise<Question[]> {
    const generated = await this.questionGenerator.generateQuestions({
      topicName,
      examName,
      count,
      focus: request.ai?.focus,
    });

    return generated.slice(0, count).map((question, index) => {
      this.assertSingleCorrectOption(question.options);
      return this.toQuestion(question, simulation.id, index, 'AI', null);
    });
  }

  private assertSingleCorrectOption(
    options: Array<{ text: string; isCorrect: boolean }>,
  ): void {
    const correctOptions = options.filter((option) => option.isCorrect);

    if (options.length < 2 || correctOptions.length !== 1) {
      throw new ValidationError(
        'A IA retornou uma questão com alternativas inválidas. Tente novamente.',
      );
    }
  }

  private toQuestion(
    question: {
      content: string;
      options: Array<{ text: string; isCorrect: boolean }>;
      explanation?: string | null;
    },
    simulationId: string,
    order: number,
    source: 'ENEM' | 'AI',
    sourceRef: string | null,
  ): Question {
    return Question.create({
      content: question.content,
      type: 'SINGLE_CHOICE',
      status: 'DRAFT',
      order,
      explanation: question.explanation ?? null,
      studyLink: null,
      source,
      sourceRef,
      aiModel: this.questionGenerator.modelName,
      simulationId,
      options: question.options.map((option, optionIndex) => ({
        text: option.text,
        isCorrect: option.isCorrect,
        order: optionIndex,
      })),
    });
  }

  private buildDefaultName(
    request: GenerateSimulationRequest,
    topicName: string,
  ): string {
    if (request.source === 'ENEM') {
      const years = request.enem?.years ?? [];
      return `ENEM ${this.formatYears(years)} — ${topicName}`;
    }

    return `Simulado de ${topicName}`;
  }

  private buildDefaultDescription(
    request: GenerateSimulationRequest,
    topicName: string,
  ): string {
    if (request.source === 'ENEM') {
      const years = request.enem?.years ?? [];
      return `Simulado gerado a partir de questões reais do ENEM (${this.formatYears(
        years,
      )}).`;
    }

    return `Simulado gerado por IA para o tópico ${topicName}.`;
  }

  private formatYears(years: number[]): string {
    const sorted = [...new Set(years)].sort((a, b) => a - b);

    if (sorted.length === 0) {
      return 'selecionado';
    }

    if (sorted.length === 1) {
      return String(sorted[0]);
    }

    const isSequential = sorted.every(
      (year, index) => index === 0 || year === sorted[index - 1] + 1,
    );

    return isSequential
      ? `${sorted[0]}–${sorted[sorted.length - 1]}`
      : sorted.join(', ');
  }
}
