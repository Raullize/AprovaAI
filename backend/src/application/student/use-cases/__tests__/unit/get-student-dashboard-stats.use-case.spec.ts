import { GetStudentDashboardStatsUseCase } from '../../get-student-dashboard-stats.use-case';
import { InMemoryUserRepository } from '../../../../../../test/repositories/in-memory-user.repository';
import { User } from '../../../../../domain/users/entities/user.entity';
import { Email } from '../../../../../domain/users/value-objects/email';

describe('GetStudentDashboardStatsUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let sut: GetStudentDashboardStatsUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    sut = new GetStudentDashboardStatsUseCase(userRepository);
  });

  it('should return the streak count and active days for the current month', async () => {
    const today = new Date();
    const user = User.create({
      fullName: 'Raul Lize',
      username: 'raullize',
      email: Email.create('raul@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
      streakCount: 7,
    });

    userRepository.items.push(user);

    await userRepository.logActivity(
      user.id,
      new Date(today.getFullYear(), today.getMonth(), 2),
    );
    await userRepository.logActivity(
      user.id,
      new Date(today.getFullYear(), today.getMonth(), 5),
    );
    await userRepository.logActivity(
      user.id,
      new Date(today.getFullYear(), today.getMonth() - 1, 10),
    );

    const result = await sut.execute({ userId: user.id });

    expect(result.streakCount).toBe(7);
    expect(result.activeDays).toEqual([2, 5]);
  });

  it('should return default values when the user does not exist', async () => {
    const result = await sut.execute({ userId: 'non-existing-id' });

    expect(result).toEqual({
      streakCount: 0,
      activeDays: [],
    });
  });
});
