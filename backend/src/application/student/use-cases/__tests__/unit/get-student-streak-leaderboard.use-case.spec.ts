import { GetStudentStreakLeaderboardUseCase } from '../../get-student-streak-leaderboard.use-case';
import { InMemoryUserRepository } from '../../../../../../test/repositories/in-memory-user.repository';
import { User } from '../../../../../domain/users/entities/user.entity';
import { Email } from '../../../../../domain/users/value-objects/email';

describe('GetStudentStreakLeaderboardUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let sut: GetStudentStreakLeaderboardUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    sut = new GetStudentStreakLeaderboardUseCase(userRepository);
  });

  it('should return the leaderboard ordered by best streak and exclude admins', async () => {
    const userA = User.create({
      fullName: 'User A',
      username: 'user-a',
      email: Email.create('user-a@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
      streakCount: 2,
      bestStreak: 2,
    });

    const userB = User.create({
      fullName: 'User B',
      username: 'user-b',
      email: Email.create('user-b@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
      streakCount: 3,
      bestStreak: 5,
    });

    const admin = User.create({
      fullName: 'Admin',
      username: 'admin',
      email: Email.create('admin@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
      bestStreak: 10,
      role: 'ADMIN',
    });

    userRepository.items.push(userA, userB, admin);

    const result = await sut.execute({ userId: userB.id });

    expect(result.topUsers).toHaveLength(2);
    expect(result.topUsers[0]).toEqual({
      rank: 1,
      fullName: 'User B',
      username: 'user-b',
      bestStreak: 5,
      streakCount: 3,
    });
    expect(result.topUsers[1]).toEqual({
      rank: 2,
      fullName: 'User A',
      username: 'user-a',
      bestStreak: 2,
      streakCount: 2,
    });
  });

  it('should return currentUserRank = 1 for the user with highest bestStreak', async () => {
    const userA = User.create({
      fullName: 'User A',
      username: 'user-a',
      email: Email.create('user-a@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
      bestStreak: 12,
      streakCount: 12,
    });

    const userB = User.create({
      fullName: 'User B',
      username: 'user-b',
      email: Email.create('user-b@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
      bestStreak: 4,
      streakCount: 4,
    });

    userRepository.items.push(userA, userB);

    const result = await sut.execute({ userId: userA.id });

    expect(result.currentUserRank).toBe(1);
    expect(result.currentUserEntry).toMatchObject({
      rank: 1,
      username: 'user-a',
      bestStreak: 12,
      streakCount: 12,
    });
  });

  it('should return correct rank for a user outside the top leaderboard', async () => {
    const topUser = User.create({
      fullName: 'Top User',
      username: 'top-user',
      email: Email.create('top@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
      bestStreak: 15,
      streakCount: 15,
    });

    const regularUser = User.create({
      fullName: 'Regular User',
      username: 'regular-user',
      email: Email.create('regular@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
      bestStreak: 3,
      streakCount: 2,
    });

    userRepository.items.push(topUser, regularUser);

    const result = await sut.execute({ userId: regularUser.id });

    expect(result.currentUserRank).toBe(2);
    expect(result.currentUserEntry?.username).toBe('regular-user');
  });
});
