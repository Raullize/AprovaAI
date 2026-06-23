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
    // Deve retornar o mês atual no formato YYYY-MM
    const expectedMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    expect(result.month).toBe(expectedMonth);
  });

  it('should return active days for a specific month when month param is provided', async () => {
    const user = User.create({
      fullName: 'Raul Lize',
      username: 'raullize',
      email: Email.create('raul@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
      streakCount: 3,
    });

    userRepository.items.push(user);

    // Atividades em maio/2026
    await userRepository.logActivity(user.id, new Date(2026, 4, 10)); // May 10
    await userRepository.logActivity(user.id, new Date(2026, 4, 15)); // May 15
    // Atividade em outro mês (não deve aparecer)
    await userRepository.logActivity(user.id, new Date(2026, 5, 1));  // June 1

    const result = await sut.execute({ userId: user.id, month: '2026-05' });

    expect(result.activeDays).toEqual(expect.arrayContaining([10, 15]));
    expect(result.activeDays).toHaveLength(2);
    expect(result.month).toBe('2026-05');
  });

  it('should return default values when the user does not exist', async () => {
    const result = await sut.execute({ userId: 'non-existing-id' });

    expect(result.streakCount).toBe(0);
    expect(result.activeDays).toEqual([]);
    expect(result.month).toBeDefined();
  });
});
