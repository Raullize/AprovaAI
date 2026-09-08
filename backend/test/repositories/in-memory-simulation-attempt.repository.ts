import { SimulationAttemptRepository } from '../../src/domain/simulations/repositories/simulation-attempt.repository';
import {
  AttemptAnswer,
  SimulationAttempt,
} from '../../src/domain/simulations/entities/simulation-attempt.entity';

export class InMemorySimulationAttemptRepository implements SimulationAttemptRepository {
  public items: SimulationAttempt[] = [];
  public answers: AttemptAnswer[] = [];

  async findById(id: string): Promise<SimulationAttempt | null> {
    const simulationAttempt = this.items.find((item) => item.id === id);
    return simulationAttempt ?? null;
  }

  async findActiveByUserIdAndSimulationId(
    userId: string,
    simulationId: string,
  ): Promise<SimulationAttempt | null> {
    const simulationAttempt = this.items.find(
      (item) =>
        item.userId === userId &&
        item.simulationId === simulationId &&
        item.status === 'IN_PROGRESS',
    );

    return simulationAttempt ?? null;
  }

  async findHistoryByUserId(userId: string): Promise<SimulationAttempt[]> {
    return this.items.filter((item) => item.userId === userId);
  }

  async create(
    simulationAttempt: SimulationAttempt,
  ): Promise<SimulationAttempt> {
    this.items.push(simulationAttempt);
    return simulationAttempt;
  }

  async save(simulationAttempt: SimulationAttempt): Promise<SimulationAttempt> {
    const index = this.items.findIndex(
      (item) => item.id === simulationAttempt.id,
    );

    if (index >= 0) {
      this.items[index] = simulationAttempt;
    } else {
      this.items.push(simulationAttempt);
    }

    return simulationAttempt;
  }

  async saveAnswer(answer: AttemptAnswer): Promise<AttemptAnswer> {
    const index = this.answers.findIndex(
      (item) =>
        item.simulationAttemptId === answer.simulationAttemptId &&
        item.questionId === answer.questionId,
    );

    if (index >= 0) {
      this.answers[index] = answer;
    } else {
      this.answers.push(answer);
    }

    const simulationAttemptIndex = this.items.findIndex(
      (item) => item.id === answer.simulationAttemptId,
    );

    if (simulationAttemptIndex >= 0) {
      const simulationAttempt = this.items[simulationAttemptIndex];
      const nextAnswers = simulationAttempt.answers.filter(
        (item) => item.questionId !== answer.questionId,
      );
      nextAnswers.push(answer);

      this.items[simulationAttemptIndex] = SimulationAttempt.create(
        {
          userId: simulationAttempt.userId,
          simulationId: simulationAttempt.simulationId,
          status: simulationAttempt.status,
          mode: simulationAttempt.mode,
          score: simulationAttempt.score,
          totalQuestions: simulationAttempt.totalQuestions,
          percentage: simulationAttempt.percentage,
          passed: simulationAttempt.passed,
          stars: simulationAttempt.stars,
          timeSpent: simulationAttempt.timeSpent,
          answers: nextAnswers,
          simulation: simulationAttempt.simulation,
          createdAt: simulationAttempt.createdAt,
          updatedAt: new Date(),
        },
        simulationAttempt.id,
      );
    }

    return answer;
  }
}
