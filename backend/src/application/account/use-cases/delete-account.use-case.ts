import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { UserRepository } from '../../../domain/users/repositories/user.repository';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';
import { ActionNotAllowedError } from '../../../shared/core/errors/action-not-allowed.error';

export interface DeleteAccountRequest {
  userId: string;
}

export interface DeleteAccountResponse {
  message: string;
}

@Injectable()
export class DeleteAccountUseCase
  implements UseCase<DeleteAccountRequest, DeleteAccountResponse>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    request: DeleteAccountRequest,
  ): Promise<DeleteAccountResponse> {
    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      throw new ResourceNotFoundError('User', request.userId);
    }

    if (user.role === 'ADMIN') {
      throw new ActionNotAllowedError('Administradores não podem excluir suas próprias contas.');
    }

    await this.userRepository.delete(user.id);

    return { message: 'Conta excluída com sucesso.' };
  }
}
