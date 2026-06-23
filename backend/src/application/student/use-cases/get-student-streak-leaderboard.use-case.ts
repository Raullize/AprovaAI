import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { UserRepository } from '../../../domain/users/repositories/user.repository';

export interface StudentStreakLeaderboardEntry {
  rank: number;
  fullName: string;
  username: string;
  bestStreak: number;
  streakCount: number;
}

export interface GetStudentStreakLeaderboardRequest {
  userId: string;
}

export interface GetStudentStreakLeaderboardResponse {
  topUsers: StudentStreakLeaderboardEntry[];
  currentUserRank: number;
  currentUserEntry: StudentStreakLeaderboardEntry | null;
}

@Injectable()
export class GetStudentStreakLeaderboardUseCase
  implements UseCase<GetStudentStreakLeaderboardRequest, GetStudentStreakLeaderboardResponse>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: GetStudentStreakLeaderboardRequest): Promise<GetStudentStreakLeaderboardResponse> {
    const [users, currentUserRank] = await Promise.all([
      this.userRepository.findStreakLeaderboard(10),
      this.userRepository.findUserRankByStreak(request.userId),
    ]);

    const topUsers: StudentStreakLeaderboardEntry[] = users.map((user, index) => ({
      rank: index + 1,
      fullName: user.fullName,
      username: user.username,
      bestStreak: user.bestStreak,
      streakCount: user.streakCount,
    }));

    const currentUser = await this.userRepository.findById(request.userId);
    const currentUserEntry: StudentStreakLeaderboardEntry | null = currentUser
      ? {
          rank: currentUserRank,
          fullName: currentUser.fullName,
          username: currentUser.username,
          bestStreak: currentUser.bestStreak,
          streakCount: currentUser.streakCount,
        }
      : null;

    return {
      topUsers,
      currentUserRank,
      currentUserEntry,
    };
  }
}
