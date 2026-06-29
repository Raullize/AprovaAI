import { UpdateAccountProfileUseCase } from '../../update-account-profile.use-case';
import { InMemoryUserRepository } from '../../../../../../test/repositories/in-memory-user.repository';
import { User } from '../../../../../domain/users/entities/user.entity';
import { Email } from '../../../../../domain/users/value-objects/email';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';
import { UserAlreadyExistsError } from '../../../../../domain/users/errors/user-already-exists.error';

describe('UpdateAccountProfileUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let sut: UpdateAccountProfileUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    sut = new UpdateAccountProfileUseCase(userRepository);
  });

  it('should be able to update the student profile', async () => {
    const user = User.create({
      fullName: 'Old Name',
      username: 'old-username',
      email: Email.create('old@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
    });

    userRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id,
      fullName: 'New Name',
      username: 'new-username',
      email: 'new@example.com',
    });

    expect(result.fullName).toBe('New Name');
    expect(result.username).toBe('new-username');
    expect(result.email).toBe('new@example.com');
    expect(userRepository.items[0].fullName).toBe('New Name');
  });

  it('should throw UserAlreadyExistsError when username is already in use', async () => {
    const user = User.create({
      fullName: 'User One',
      username: 'user-one',
      email: Email.create('user-one@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
    });

    const anotherUser = User.create({
      fullName: 'User Two',
      username: 'user-two',
      email: Email.create('user-two@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
    });

    userRepository.items.push(user, anotherUser);

    await expect(
      sut.execute({
        userId: user.id,
        username: anotherUser.username,
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });

  it('should throw UserAlreadyExistsError when email is already in use', async () => {
    const user = User.create({
      fullName: 'User One',
      username: 'user-one',
      email: Email.create('user-one@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
    });

    const anotherUser = User.create({
      fullName: 'User Two',
      username: 'user-two',
      email: Email.create('user-two@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
    });

    userRepository.items.push(user, anotherUser);

    await expect(
      sut.execute({
        userId: user.id,
        email: anotherUser.email.value,
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });

  it('should throw ResourceNotFoundError when the user does not exist', async () => {
    await expect(
      sut.execute({
        userId: 'non-existing-id',
        fullName: 'New Name',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should be able to update the student avatar url', async () => {
    const user = User.create({
      fullName: 'Name',
      username: 'username',
      email: Email.create('user@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
      avatarUrl: 'old-avatar.png',
    });

    userRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id,
      avatarUrl: 'new-avatar.png',
    });

    expect(result.avatarUrl).toBe('new-avatar.png');
    expect(userRepository.items[0].avatarUrl).toBe('new-avatar.png');
  });
});
