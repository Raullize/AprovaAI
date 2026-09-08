import { UpdateAccountPasswordUseCase } from '../../update-account-password.use-case';
import { InMemoryUserRepository } from '../../../../../../test/repositories/in-memory-user.repository';
import { FakeHashProvider } from '../../../../../../test/providers/fake-hash.provider';
import { User } from '../../../../../domain/users/entities/user.entity';
import { Email } from '../../../../../domain/users/value-objects/email';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';
import { InvalidCurrentPasswordError } from '../../../../../domain/users/errors/invalid-current-password.error';

describe('UpdateAccountPasswordUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let hashProvider: FakeHashProvider;
  let sut: UpdateAccountPasswordUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    hashProvider = new FakeHashProvider();
    sut = new UpdateAccountPasswordUseCase(userRepository, hashProvider);
  });

  it('should be able to update the student password', async () => {
    const user = User.create({
      fullName: 'Raul Lize',
      username: 'raullize',
      email: Email.create('raul@example.com'),
      passwordHash: await hashProvider.hash('old-password'),
      dateOfBirth: new Date('1998-01-01'),
    });

    userRepository.items.push(user);

    const result = await sut.execute({
      userId: user.id,
      currentPassword: 'old-password',
      newPassword: 'new-password',
    });

    expect(result.message).toBe('Senha atualizada com sucesso.');
    await expect(
      hashProvider.compare(
        'new-password',
        userRepository.items[0].passwordHash,
      ),
    ).resolves.toBe(true);
  });

  it('should throw InvalidCurrentPasswordError when the current password is invalid', async () => {
    const user = User.create({
      fullName: 'Raul Lize',
      username: 'raullize',
      email: Email.create('raul@example.com'),
      passwordHash: await hashProvider.hash('correct-password'),
      dateOfBirth: new Date('1998-01-01'),
    });

    userRepository.items.push(user);

    await expect(
      sut.execute({
        userId: user.id,
        currentPassword: 'wrong-password',
        newPassword: 'new-password',
      }),
    ).rejects.toBeInstanceOf(InvalidCurrentPasswordError);
  });

  it('should throw ResourceNotFoundError when the user does not exist', async () => {
    await expect(
      sut.execute({
        userId: 'non-existing-id',
        currentPassword: 'old-password',
        newPassword: 'new-password',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
