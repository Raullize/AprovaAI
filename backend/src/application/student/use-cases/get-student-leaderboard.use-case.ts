import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { UserRepository } from '../../../domain/users/repositories/user.repository';

export interface StudentLeaderboardEntry {
  rank: number;
  fullName: string;
  username: string;
  xp: number;
}

@Injectable()
export class GetStudentLeaderboardUseCase
  implements UseCase<void, StudentLeaderboardEntry[]>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<StudentLeaderboardEntry[]> {
    const users = await this.userRepository.findLeaderboard(10);

    return users.map((user, index) => ({
      rank: index + 1,
      fullName: user.fullName,
      username: user.username,
      xp: user.xp,
    }));
  }
}
