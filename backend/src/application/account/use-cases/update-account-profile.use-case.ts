import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { UserRepository } from '../../../domain/users/repositories/user.repository';
import { Email } from '../../../domain/users/value-objects/email';
import { ResourceNotFoundError } from '../../../shared/core/errors/resource-not-found.error';
import { UserAlreadyExistsError } from '../../../domain/users/errors/user-already-exists.error';
import { AccountProfileResponse } from './get-account-profile.use-case';

export interface UpdateAccountProfileRequest {
  userId: string;
  fullName?: string;
  email?: string;
  username?: string;
  avatarUrl?: string | null;
}

@Injectable()
export class UpdateAccountProfileUseCase implements UseCase<
  UpdateAccountProfileRequest,
  AccountProfileResponse
> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    request: UpdateAccountProfileRequest,
  ): Promise<AccountProfileResponse> {
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

    if (request.avatarUrl !== undefined) {
      user.changeAvatarUrl(request.avatarUrl);
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
      bestStreak: savedUser.bestStreak,
      lastActiveAt: savedUser.lastActiveAt,
      avatarUrl: savedUser.avatarUrl,
      createdAt: savedUser.createdAt,
    };
  }
}
