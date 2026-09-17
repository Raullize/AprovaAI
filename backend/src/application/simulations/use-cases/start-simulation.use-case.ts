import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { SimulationAttemptRepository } from '../../../domain/simulations/repositories/simulation-attempt.repository';
import { SimulationAttempt } from '../../../domain/simulations/entities/simulation-attempt.entity';
import { SimulationRepository } from '../../../domain/content/repositories/simulation.repository';
import { Simulation } from '../../../domain/content/entities/simulation.entity';
import { TopicRepository } from '../../../domain/content/repositories/topic.repository';
import { ExamRepository } from '../../../domain/content/repositories/exam.repository';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';
import { ValidationError } from '../../../shared/core/errors/validation.error';

export interface StartSimulationRequest {
  userId: string;
  simulationId: string;
}

@Injectable()
export class StartSimulationUseCase implements UseCase<
  StartSimulationRequest,
  SimulationAttempt
> {
  constructor(
    private readonly simulationAttemptRepository: SimulationAttemptRepository,
    private readonly simulationRepository: SimulationRepository,
    private readonly topicRepository: TopicRepository,
    private readonly examRepository: ExamRepository,
  ) {}

  async execute(request: StartSimulationRequest): Promise<SimulationAttempt> {
    // 1. Check if simulation exists and count questions
    const simulation = await this.simulationRepository.findById(
      request.simulationId,
    );
    if (!simulation) {
      throw new ResourceNotFoundError('Simulation', request.simulationId);
    }

    if (simulation.status !== 'PUBLISHED') {
      throw new ResourceNotFoundError('Simulation', request.simulationId);
    }

    if (simulation.questionsCount === 0) {
      throw new ValidationError(
        'Cannot start a simulation for a simulation with no questions',
      );
    }

    // 2. Enforce trail order unless the exam allows free (unordered) access
    await this.ensureOrderUnlocked(request.userId, simulation);

    // 3. Check if user already has an active simulation for this simulation
    const activeSimulation =
      await this.simulationAttemptRepository.findActiveByUserIdAndSimulationId(
        request.userId,
        request.simulationId,
      );

    if (activeSimulation) {
      // Resume existing simulation
      return activeSimulation;
    }

    // 4. Create new simulation
    const newSimulation = SimulationAttempt.create({
      userId: request.userId,
      simulationId: request.simulationId,
      status: 'IN_PROGRESS',
      mode: simulation.simulationMode,
      totalQuestions: simulation.questionsCount,
      answers: [],
    });

    return this.simulationAttemptRepository.create(newSimulation);
  }

  private async ensureOrderUnlocked(
    userId: string,
    simulation: Simulation,
  ): Promise<void> {
    const topic = await this.topicRepository.findById(simulation.topicId);
    if (!topic) {
      throw new ResourceNotFoundError('Topic', simulation.topicId);
    }

    const exam = await this.examRepository.findById(topic.examId);
    if (!exam) {
      throw new ResourceNotFoundError('Exam', topic.examId);
    }

    if (exam.allowUnordered) {
      return;
    }

    const orderedSimulations = await this.getOrderedSimulations(topic.examId);
    const targetIndex = orderedSimulations.findIndex(
      (item) => item.id === simulation.id,
    );

    if (targetIndex <= 0) {
      return;
    }

    const previousIds = orderedSimulations
      .slice(0, targetIndex)
      .map((item) => item.id);

    const history =
      await this.simulationAttemptRepository.findHistoryByUserId(userId);
    const passedIds = new Set(
      history.filter((item) => item.passed).map((item) => item.simulationId),
    );

    const hasAllPreviousPassed = previousIds.every((id) => passedIds.has(id));

    if (!hasAllPreviousPassed) {
      throw new ResourceNotFoundError('Simulation', simulation.id);
    }
  }

  private async getOrderedSimulations(examId: string): Promise<Simulation[]> {
    const topics = (await this.topicRepository.findByExamId(examId)).sort(
      (a, b) => a.order - b.order,
    );

    const ordered: Simulation[] = [];
    for (const topic of topics) {
      if (topic.status !== 'PUBLISHED') {
        continue;
      }

      const simulations = await this.simulationRepository.findByTopicId(
        topic.id,
      );
      ordered.push(
        ...simulations
          .filter(
            (item) => item.status === 'PUBLISHED' && item.questionsCount > 0,
          )
          .sort((a, b) => a.order - b.order),
      );
    }

    return ordered;
  }
}
