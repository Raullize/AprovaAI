import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { UserRepository } from '../../../domain/users/repositories/user.repository';
import { Email } from '../../../domain/users/value-objects/email';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';
import { UserAlreadyExistsError } from '../../../domain/users/errors/user-already-exists.error';
import { StudentProfileResponse } from './get-student-profile.use-case';

export interface UpdateStudentProfileRequest {
  userId: string;
  fullName?: string;
  email?: string;
  username?: string;
}

@Injectable()
export class UpdateStudentProfileUseCase
  implements UseCase<UpdateStudentProfileRequest, StudentProfileResponse>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    request: UpdateStudentProfileRequest,
  ): Promise<StudentProfileResponse> {
    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      throw new ResourceNotFoundError('User', request.userId);
    }

    if (request.username && request.username !== user.username) {
      const existingUser = await this.userRepository.findByUsername(
        request.username,
      );

      if (existingUser) {
        throw new UserAlreadyExistsError('username');
      }

      user.changeUsername(request.username);
    }

    if (request.email && request.email !== user.email.value) {
      const existingUser = await this.userRepository.findByEmail(request.email);

      if (existingUser) {
        throw new UserAlreadyExistsError('email');
      }

      user.changeEmail(Email.create(request.email));
    }

    if (request.fullName) {
      user.changeFullName(request.fullName);
    }

    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      fullName: savedUser.fullName,
      username: savedUser.username,
      email: savedUser.email.value,
      role: savedUser.role,
      subscriptionPlan: savedUser.subscriptionPlan,
      xp: savedUser.xp,
      streakCount: savedUser.streakCount,
      lastActiveAt: savedUser.lastActiveAt,
    };
  }
}
