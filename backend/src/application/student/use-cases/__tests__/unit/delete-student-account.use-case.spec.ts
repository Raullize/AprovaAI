import { DeleteStudentAccountUseCase } from '../../delete-student-account.use-case';
import { InMemoryUserRepository } from '../../../../../../test/repositories/in-memory-user.repository';
import { User } from '../../../../../domain/users/entities/user.entity';
import { Email } from '../../../../../domain/users/value-objects/email';
import { ResourceNotFoundError } from '../../../../../shared/core/errors/resource-not-found.error';

describe('DeleteStudentAccountUseCase', () => {
  let userRepository: InMemoryUserRepository;
  let sut: DeleteStudentAccountUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    sut = new DeleteStudentAccountUseCase(userRepository);
  });

  it('should be able to delete the student account', async () => {
    const user = User.create({
      fullName: 'Raul Lize',
      username: 'raullize',
      email: Email.create('raul@example.com'),
      passwordHash: 'hashed-password',
      dateOfBirth: new Date('1998-01-01'),
    });

    userRepository.items.push(user);

    const result = await sut.execute({ userId: user.id });

    expect(result.message).toBe('Conta excluída com sucesso.');
    expect(userRepository.items).toHaveLength(0);
  });

  it('should throw ResourceNotFoundError when the user does not exist', async () => {
    await expect(
      sut.execute({ userId: 'non-existing-id' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
