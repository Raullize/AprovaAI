import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { UserRepository } from '../../../domain/users/repositories/user.repository';
import { HashProvider } from '../../auth/ports/hash-provider';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';
import { InvalidCurrentPasswordError } from '../../../domain/users/errors/invalid-current-password.error';

export interface UpdateStudentPasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface UpdateStudentPasswordResponse {
  message: string;
}

@Injectable()
export class UpdateStudentPasswordUseCase
  implements
    UseCase<UpdateStudentPasswordRequest, UpdateStudentPasswordResponse>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashProvider: HashProvider,
  ) {}

  async execute(
    request: UpdateStudentPasswordRequest,
  ): Promise<UpdateStudentPasswordResponse> {
    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      throw new ResourceNotFoundError('User', request.userId);
    }

    const isCurrentPasswordValid = await this.hashProvider.compare(
      request.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new InvalidCurrentPasswordError();
    }

    const newPasswordHash = await this.hashProvider.hash(request.newPassword);

    user.changePassword(newPasswordHash);
    await this.userRepository.save(user);

    return { message: 'Senha atualizada com sucesso.' };
  }
}
