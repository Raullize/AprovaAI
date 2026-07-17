import { GetSimulationHistoryUseCase } from '../../get-simulation-history.use-case';
import { InMemorySimulationAttemptRepository } from '../../../../../../test/repositories/in-memory-simulation-attempt.repository';
import { SimulationAttempt } from '../../../../../domain/simulations/entities/simulation-attempt.entity';

describe('GetSimulationHistoryUseCase', () => {
  let simulationAttemptRepository: InMemorySimulationAttemptRepository;
  let sut: GetSimulationHistoryUseCase;

  beforeEach(() => {
    simulationAttemptRepository = new InMemorySimulationAttemptRepository();
    sut = new GetSimulationHistoryUseCase(simulationAttemptRepository);
  });

  it('should return the history for the requested user', async () => {
    const userAttempt = SimulationAttempt.create({
      userId: 'user-1',
      simulationId: 'simulation-1',
      status: 'COMPLETED',
      totalQuestions: 5,
      answers: [],
    });

    const anotherAttempt = SimulationAttempt.create({
      userId: 'user-2',
      simulationId: 'simulation-2',
      status: 'COMPLETED',
      totalQuestions: 5,
      answers: [],
    });

    await simulationAttemptRepository.create(userAttempt);
    await simulationAttemptRepository.create(anotherAttempt);

    const result = await sut.execute({ userId: 'user-1' });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(userAttempt.id);
  });
});
