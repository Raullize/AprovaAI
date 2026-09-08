import {
  SimulationAttempt,
  AttemptAnswer,
} from '../entities/simulation-attempt.entity';

export abstract class SimulationAttemptRepository {
  abstract findById(id: string): Promise<SimulationAttempt | null>;
  abstract findActiveByUserIdAndSimulationId(
    userId: string,
    simulationId: string,
  ): Promise<SimulationAttempt | null>;
  abstract findHistoryByUserId(userId: string): Promise<SimulationAttempt[]>;
  abstract create(
    simulationAttempt: SimulationAttempt,
  ): Promise<SimulationAttempt>;
  abstract save(
    simulationAttempt: SimulationAttempt,
  ): Promise<SimulationAttempt>;
  abstract saveAnswer(answer: AttemptAnswer): Promise<AttemptAnswer>;
}
