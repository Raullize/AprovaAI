import { GetSimulationHistoryUseCase } from '../../get-simulation-history.use-case';
import { InMemoryExamResultRepository } from '../../../../../../test/repositories/in-memory-exam-result.repository';
import { ExamResult } from '../../../../../domain/simulations/entities/exam-result.entity';

describe('GetSimulationHistoryUseCase', () => {
  let examResultRepository: InMemoryExamResultRepository;
  let sut: GetSimulationHistoryUseCase;

  beforeEach(() => {
    examResultRepository = new InMemoryExamResultRepository();
    sut = new GetSimulationHistoryUseCase(examResultRepository);
  });

  it('should return the history for the requested user', async () => {
    const userAttempt = ExamResult.create({
      userId: 'user-1',
      levelId: 'level-1',
      status: 'COMPLETED',
      totalQuestions: 5,
      answers: [],
    });

    const anotherAttempt = ExamResult.create({
      userId: 'user-2',
      levelId: 'level-2',
      status: 'COMPLETED',
      totalQuestions: 5,
      answers: [],
    });

    await examResultRepository.create(userAttempt);
    await examResultRepository.create(anotherAttempt);

    const result = await sut.execute({ userId: 'user-1' });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(userAttempt.id);
  });
});
