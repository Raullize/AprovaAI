import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { UserRepository } from '../../../domain/users/repositories/user.repository';

export interface GetAccountProfileRequest {
  userId: string;
}

export interface AccountProfileResponse {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  subscriptionPlan: string;
  xp: number;
  streakCount: number;
  bestStreak: number;
  lastActiveAt: Date | null | undefined;
  avatarUrl: string | null | undefined;
  createdAt?: Date;
}

@Injectable()
export class GetAccountProfileUseCase
  implements UseCase<GetAccountProfileRequest, AccountProfileResponse | null>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    request: GetAccountProfileRequest,
  ): Promise<AccountProfileResponse | null> {
    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email.value,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      xp: user.xp,
      streakCount: user.streakCount,
      bestStreak: user.bestStreak,
      lastActiveAt: user.lastActiveAt,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  }
}
