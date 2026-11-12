import { SimulationAttemptRepository } from '../../domain/simulations/repositories/simulation-attempt.repository';
import { SimulationAttempt } from '../../domain/simulations/entities/simulation-attempt.entity';
import { ConflictError } from '../../shared/core/errors/conflict.error';
import { ResourceNotFoundError } from '../../shared/core/errors/resource-not-found.error';

export async function getCompletedAttemptForUser(
  simulationAttemptRepository: SimulationAttemptRepository,
  userId: string,
  simulationAttemptId: string,
): Promise<SimulationAttempt> {
  const attempt =
    await simulationAttemptRepository.findById(simulationAttemptId);

  if (!attempt || attempt.userId !== userId) {
    throw new ResourceNotFoundError('SimulationAttempt', simulationAttemptId);
  }

  if (attempt.status !== 'COMPLETED') {
    throw new ConflictError(
      'O Professor Sabichão só pode comentar simulados concluídos.',
    );
  }

  return attempt;
}
