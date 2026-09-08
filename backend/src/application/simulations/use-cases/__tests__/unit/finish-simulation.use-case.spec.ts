import { FinishSimulationUseCase } from '../../finish-simulation.use-case';
import { InMemorySimulationAttemptRepository } from '../../../../../../test/repositories/in-memory-simulation-attempt.repository';
import { InMemorySimulationRepository } from '../../../../../../test/repositories/in-memory-simulation.repository';
import { InMemoryUserRepository } from '../../../../../../test/repositories/in-memory-user.repository';
import {
  AttemptAnswer,
  SimulationAttempt,
} from '../../../../../domain/simulations/entities/simulation-attempt.entity';
import { Simulation } from '../../../../../domain/content/entities/simulation.entity';
import { User } from '../../../../../domain/users/entities/user.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { Percentage } from '../../../../../domain/content/value-objects/percentage';
import { Email } from '../../../../../domain/users/value-objects/email';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';
import { ValidationError } from '../../../../../shared/core/errors/validation.error';

describe('FinishSimulationUseCase', () => {
  let simulationAttemptRepository: InMemorySimulationAttemptRepository;
  let simulationRepository: InMemorySimulationRepository;
  let userRepository: InMemoryUserRepository;
  let sut: FinishSimulationUseCase;

  beforeEach(() => {
    simulationAttemptRepository = new InMemorySimulationAttemptRepository();
    simulationRepository = new InMemorySimulationRepository();
    userRepository = new InMemoryUserRepository();
    sut = new FinishSimulationUseCase(
      simulationAttemptRepository,
      simulationRepository,
      userRepository,
    );
  });

  it('should finish a simulation, calculate stars and grant xp delta', async () => {
    const user = User.create({
      fullName: 'Raul Lize',
      username: 'raullize',
      email: Email.create('raul@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
      xp: 0,
    });

    const simulation = Simulation.create({
      name: 'Nivel 1',
      slug: Slug.create('nivel-1'),
      topicId: 'topic-1',
      order: 0,
      xpReward: 100,
      passingPercentage: Percentage.create(70),
      questionsCount: 5,
    });

    const previousAttempt = SimulationAttempt.create({
      userId: user.id,
      simulationId: simulation.id,
      status: 'COMPLETED',
      totalQuestions: 5,
      stars: 1,
      answers: [],
    });

    const currentAttempt = SimulationAttempt.create({
      userId: user.id,
      simulationId: simulation.id,
      status: 'IN_PROGRESS',
      totalQuestions: 5,
      answers: [
        AttemptAnswer.create({
          simulationAttemptId: 'attempt',
          questionId: 'q1',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
        AttemptAnswer.create({
          simulationAttemptId: 'attempt',
          questionId: 'q2',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
        AttemptAnswer.create({
          simulationAttemptId: 'attempt',
          questionId: 'q3',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
        AttemptAnswer.create({
          simulationAttemptId: 'attempt',
          questionId: 'q4',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
        AttemptAnswer.create({
          simulationAttemptId: 'attempt',
          questionId: 'q5',
          selectedOptions: ['a'],
          isCorrect: false,
        }),
      ],
    });

    await userRepository.create(user);
    await simulationRepository.create(simulation);
    await simulationAttemptRepository.create(previousAttempt);
    await simulationAttemptRepository.create(currentAttempt);

    const result = await sut.execute({
      userId: user.id,
      simulationAttemptId: currentAttempt.id,
      timeSpent: 300,
    });

    expect(result.simulationAttempt.status).toBe('COMPLETED');
    expect(result.simulationAttempt.passed).toBe(true);
    expect(result.simulationAttempt.stars).toBe(2);
    expect(result.xpGained).toBe(30);
    expect(userRepository.items[0].xp).toBe(30);
    expect(userRepository.activities).toHaveLength(1);
  });

  it('should not grant xp when previous attempt already has equal or better stars', async () => {
    const user = User.create({
      fullName: 'Raul Lize',
      username: 'raullize',
      email: Email.create('raul@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
      xp: 50,
    });

    const simulation = Simulation.create({
      name: 'Nivel 2',
      slug: Slug.create('nivel-2'),
      topicId: 'topic-1',
      order: 1,
      xpReward: 100,
      passingPercentage: Percentage.create(70),
      questionsCount: 5,
    });

    const previousAttempt = SimulationAttempt.create({
      userId: user.id,
      simulationId: simulation.id,
      status: 'COMPLETED',
      totalQuestions: 5,
      stars: 3,
      answers: [],
    });

    const currentAttempt = SimulationAttempt.create({
      userId: user.id,
      simulationId: simulation.id,
      status: 'IN_PROGRESS',
      totalQuestions: 5,
      answers: [
        AttemptAnswer.create({
          simulationAttemptId: 'attempt',
          questionId: 'q1',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
        AttemptAnswer.create({
          simulationAttemptId: 'attempt',
          questionId: 'q2',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
        AttemptAnswer.create({
          simulationAttemptId: 'attempt',
          questionId: 'q3',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
        AttemptAnswer.create({
          simulationAttemptId: 'attempt',
          questionId: 'q4',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
        AttemptAnswer.create({
          simulationAttemptId: 'attempt',
          questionId: 'q5',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
      ],
    });

    await userRepository.create(user);
    await simulationRepository.create(simulation);
    await simulationAttemptRepository.create(previousAttempt);
    await simulationAttemptRepository.create(currentAttempt);

    const result = await sut.execute({
      userId: user.id,
      simulationAttemptId: currentAttempt.id,
    });

    expect(result.simulationAttempt.stars).toBe(3);
    expect(result.xpGained).toBe(0);
    expect(userRepository.items[0].xp).toBe(50);
  });

  it('should throw ValidationError when simulation belongs to another user', async () => {
    const user = User.create({
      fullName: 'Raul Lize',
      username: 'raullize',
      email: Email.create('raul@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
    });

    const simulation = Simulation.create({
      name: 'Nivel 3',
      slug: Slug.create('nivel-3'),
      topicId: 'topic-1',
      order: 2,
      xpReward: 100,
      passingPercentage: Percentage.create(70),
      questionsCount: 5,
    });

    const currentAttempt = SimulationAttempt.create({
      userId: 'another-user',
      simulationId: simulation.id,
      status: 'IN_PROGRESS',
      totalQuestions: 5,
      answers: [],
    });

    await userRepository.create(user);
    await simulationRepository.create(simulation);
    await simulationAttemptRepository.create(currentAttempt);

    await expect(
      sut.execute({
        userId: user.id,
        simulationAttemptId: currentAttempt.id,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should throw ResourceNotFoundError when user does not exist', async () => {
    const simulation = Simulation.create({
      name: 'Nivel 4',
      slug: Slug.create('nivel-4'),
      topicId: 'topic-1',
      order: 3,
      xpReward: 100,
      passingPercentage: Percentage.create(70),
      questionsCount: 5,
    });

    const currentAttempt = SimulationAttempt.create({
      userId: 'missing-user',
      simulationId: simulation.id,
      status: 'IN_PROGRESS',
      totalQuestions: 5,
      answers: [],
    });

    await simulationRepository.create(simulation);
    await simulationAttemptRepository.create(currentAttempt);

    await expect(
      sut.execute({
        userId: 'missing-user',
        simulationAttemptId: currentAttempt.id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
