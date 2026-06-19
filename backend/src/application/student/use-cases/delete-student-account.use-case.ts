import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { UserRepository } from '../../../domain/users/repositories/user.repository';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';

export interface DeleteStudentAccountRequest {
  userId: string;
}

export interface DeleteStudentAccountResponse {
  message: string;
}

@Injectable()
export class DeleteStudentAccountUseCase
  implements UseCase<DeleteStudentAccountRequest, DeleteStudentAccountResponse>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    request: DeleteStudentAccountRequest,
  ): Promise<DeleteStudentAccountResponse> {
    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      throw new ResourceNotFoundError('User', request.userId);
    }

    await this.userRepository.delete(user.id);

    return { message: 'Conta excluída com sucesso.' };
  }
}
