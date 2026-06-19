import { GetStudentLeaderboardUseCase } from '../../get-student-leaderboard.use-case';
import { InMemoryUserRepository } from '../../../../../../test/repositories/in-memory-user.repository';
import { User } from '../../../../../domain/users/entities/user.entity';
import { Email } from '../../../../../domain/users/value-objects/email';

describe('GetStudentLeaderboardUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let sut: GetStudentLeaderboardUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    sut = new GetStudentLeaderboardUseCase(userRepository);
  });

  it('should return the leaderboard ordered by xp and exclude admins', async () => {
    const userA = User.create({
      fullName: 'User A',
      username: 'user-a',
      email: Email.create('user-a@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
      xp: 100,
    });

    const userB = User.create({
      fullName: 'User B',
      username: 'user-b',
      email: Email.create('user-b@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
      xp: 300,
    });

    const admin = User.create({
      fullName: 'Admin',
      username: 'admin',
      email: Email.create('admin@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
      xp: 999,
      role: 'ADMIN',
    });

    userRepository.items.push(userA, userB, admin);

    const result = await sut.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      rank: 1,
      fullName: 'User B',
      username: 'user-b',
      xp: 300,
    });
    expect(result[1]).toEqual({
      rank: 2,
      fullName: 'User A',
      username: 'user-a',
      xp: 100,
    });
  });
});
