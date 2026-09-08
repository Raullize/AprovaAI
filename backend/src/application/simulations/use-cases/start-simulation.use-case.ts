import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { SimulationAttemptRepository } from '../../../domain/simulations/repositories/simulation-attempt.repository';
import { SimulationAttempt } from '../../../domain/simulations/entities/simulation-attempt.entity';
import { SimulationRepository } from '../../../domain/content/repositories/simulation.repository';
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
  ) {}

  async execute(request: StartSimulationRequest): Promise<SimulationAttempt> {
    // 1. Check if simulation exists and count questions
    const simulation = await this.simulationRepository.findById(
      request.simulationId,
    );
    if (!simulation) {
      throw new ResourceNotFoundError('Simulation', request.simulationId);
    }

    if (simulation.questionsCount === 0) {
      throw new ValidationError(
        'Cannot start a simulation for a simulation with no questions',
      );
    }

    // 2. Check if user already has an active simulation for this simulation
    const activeSimulation =
      await this.simulationAttemptRepository.findActiveByUserIdAndSimulationId(
        request.userId,
        request.simulationId,
      );

    if (activeSimulation) {
      // Resume existing simulation
      return activeSimulation;
    }

    // 3. Create new simulation
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
}
