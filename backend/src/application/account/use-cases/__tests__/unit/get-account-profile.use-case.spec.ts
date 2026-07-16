import { GetAccountProfileUseCase } from '../../get-account-profile.use-case';
import { InMemoryUserRepository } from '../../../../../../test/repositories/in-memory-user.repository';
import { User } from '../../../../../domain/users/entities/user.entity';
import { Email } from '../../../../../domain/users/value-objects/email';

describe('GetAccountProfileUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let sut: GetAccountProfileUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    sut = new GetAccountProfileUseCase(userRepository);
  });

  it('should return the student profile when the user exists', async () => {
    const user = User.create({
      fullName: 'Raul Lize',
      username: 'raullize',
      email: Email.create('raul@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
      xp: 120,
      streakCount: 3,
      bestStreak: 4,
    });

    userRepository.items.push(user);

    const result = await sut.execute({ userId: user.id });

    expect(result).toEqual({
      id: user.id,
      fullName: 'Raul Lize',
      username: 'raullize',
      email: 'raul@example.com',
      role: 'STUDENT',
      subscriptionPlan: 'FREE',
      xp: 120,
      streakCount: 3,
      bestStreak: 4,
      lastActiveAt: null,
      avatarUrl: null,
      createdAt: user.createdAt,
    });
  });

  it('should return null when the user does not exist', async () => {
    const result = await sut.execute({ userId: 'non-existing-id' });

    expect(result).toBeNull();
  });
});
