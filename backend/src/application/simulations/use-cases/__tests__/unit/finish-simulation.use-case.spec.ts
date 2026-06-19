import { FinishSimulationUseCase } from '../../finish-simulation.use-case';
import { InMemoryExamResultRepository } from '../../../../../../test/repositories/in-memory-exam-result.repository';
import { InMemoryLevelRepository } from '../../../../../../test/repositories/in-memory-level.repository';
import { InMemoryUserRepository } from '../../../../../../test/repositories/in-memory-user.repository';
import { ExamAnswer, ExamResult } from '../../../../../domain/simulations/entities/exam-result.entity';
import { Level } from '../../../../../domain/content/entities/level.entity';
import { User } from '../../../../../domain/users/entities/user.entity';
import { Slug } from '../../../../../domain/content/value-objects/slug';
import { Percentage } from '../../../../../domain/content/value-objects/percentage';
import { Email } from '../../../../../domain/users/value-objects/email';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';
import { ValidationError } from '../../../../../shared/core/errors/validation.error';

describe('FinishSimulationUseCase', () => {
  let examResultRepository: InMemoryExamResultRepository;
  let levelRepository: InMemoryLevelRepository;
  let userRepository: InMemoryUserRepository;
  let sut: FinishSimulationUseCase;

  beforeEach(() => {
    examResultRepository = new InMemoryExamResultRepository();
    levelRepository = new InMemoryLevelRepository();
    userRepository = new InMemoryUserRepository();
    sut = new FinishSimulationUseCase(
      examResultRepository,
      levelRepository,
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

    const level = Level.create({
      name: 'Nivel 1',
      slug: Slug.create('nivel-1'),
      topicId: 'topic-1',
      order: 0,
      xpReward: 100,
      passingPercentage: Percentage.create(70),
      questionsCount: 5,
    });

    const previousAttempt = ExamResult.create({
      userId: user.id,
      levelId: level.id,
      status: 'COMPLETED',
      totalQuestions: 5,
      stars: 1,
      answers: [],
    });

    const currentAttempt = ExamResult.create({
      userId: user.id,
      levelId: level.id,
      status: 'IN_PROGRESS',
      totalQuestions: 5,
      answers: [
        ExamAnswer.create({
          examResultId: 'attempt',
          questionId: 'q1',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
        ExamAnswer.create({
          examResultId: 'attempt',
          questionId: 'q2',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
        ExamAnswer.create({
          examResultId: 'attempt',
          questionId: 'q3',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
        ExamAnswer.create({
          examResultId: 'attempt',
          questionId: 'q4',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
        ExamAnswer.create({
          examResultId: 'attempt',
          questionId: 'q5',
          selectedOptions: ['a'],
          isCorrect: false,
        }),
      ],
    });

    await userRepository.create(user);
    await levelRepository.create(level);
    await examResultRepository.create(previousAttempt);
    await examResultRepository.create(currentAttempt);

    const result = await sut.execute({
      userId: user.id,
      examResultId: currentAttempt.id,
      timeSpent: 300,
    });

    expect(result.examResult.status).toBe('COMPLETED');
    expect(result.examResult.passed).toBe(true);
    expect(result.examResult.stars).toBe(2);
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

    const level = Level.create({
      name: 'Nivel 2',
      slug: Slug.create('nivel-2'),
      topicId: 'topic-1',
      order: 1,
      xpReward: 100,
      passingPercentage: Percentage.create(70),
      questionsCount: 5,
    });

    const previousAttempt = ExamResult.create({
      userId: user.id,
      levelId: level.id,
      status: 'COMPLETED',
      totalQuestions: 5,
      stars: 3,
      answers: [],
    });

    const currentAttempt = ExamResult.create({
      userId: user.id,
      levelId: level.id,
      status: 'IN_PROGRESS',
      totalQuestions: 5,
      answers: [
        ExamAnswer.create({
          examResultId: 'attempt',
          questionId: 'q1',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
        ExamAnswer.create({
          examResultId: 'attempt',
          questionId: 'q2',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
        ExamAnswer.create({
          examResultId: 'attempt',
          questionId: 'q3',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
        ExamAnswer.create({
          examResultId: 'attempt',
          questionId: 'q4',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
        ExamAnswer.create({
          examResultId: 'attempt',
          questionId: 'q5',
          selectedOptions: ['a'],
          isCorrect: true,
        }),
      ],
    });

    await userRepository.create(user);
    await levelRepository.create(level);
    await examResultRepository.create(previousAttempt);
    await examResultRepository.create(currentAttempt);

    const result = await sut.execute({
      userId: user.id,
      examResultId: currentAttempt.id,
    });

    expect(result.examResult.stars).toBe(3);
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

    const level = Level.create({
      name: 'Nivel 3',
      slug: Slug.create('nivel-3'),
      topicId: 'topic-1',
      order: 2,
      xpReward: 100,
      passingPercentage: Percentage.create(70),
      questionsCount: 5,
    });

    const currentAttempt = ExamResult.create({
      userId: 'another-user',
      levelId: level.id,
      status: 'IN_PROGRESS',
      totalQuestions: 5,
      answers: [],
    });

    await userRepository.create(user);
    await levelRepository.create(level);
    await examResultRepository.create(currentAttempt);

    await expect(
      sut.execute({
        userId: user.id,
        examResultId: currentAttempt.id,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('should throw ResourceNotFoundError when user does not exist', async () => {
    const level = Level.create({
      name: 'Nivel 4',
      slug: Slug.create('nivel-4'),
      topicId: 'topic-1',
      order: 3,
      xpReward: 100,
      passingPercentage: Percentage.create(70),
      questionsCount: 5,
    });

    const currentAttempt = ExamResult.create({
      userId: 'missing-user',
      levelId: level.id,
      status: 'IN_PROGRESS',
      totalQuestions: 5,
      answers: [],
    });

    await levelRepository.create(level);
    await examResultRepository.create(currentAttempt);

    await expect(
      sut.execute({
        userId: 'missing-user',
        examResultId: currentAttempt.id,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
