import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { UserRepository } from '../../../domain/users/repositories/user.repository';

export interface StudentLeaderboardEntry {
  rank: number;
  fullName: string;
  username: string;
  xp: number;
}

export interface GetStudentLeaderboardRequest {
  userId: string;
}

export interface GetStudentLeaderboardResponse {
  topUsers: StudentLeaderboardEntry[];
  currentUserRank: number;
  currentUserEntry: StudentLeaderboardEntry | null;
}

@Injectable()
export class GetStudentLeaderboardUseCase
  implements UseCase<GetStudentLeaderboardRequest, GetStudentLeaderboardResponse>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: GetStudentLeaderboardRequest): Promise<GetStudentLeaderboardResponse> {
    const [users, currentUserRank] = await Promise.all([
      this.userRepository.findLeaderboard(10),
      this.userRepository.findUserRankByXp(request.userId),
    ]);

    const topUsers: StudentLeaderboardEntry[] = users.map((user, index) => ({
      rank: index + 1,
      fullName: user.fullName,
      username: user.username,
      xp: user.xp,
    }));

    // Verifica se o usuário atual já está no top-10
    const currentUserInTop = topUsers.find((u) => u.username === users.find(
      (_, i) => topUsers[i]?.username === u.username
    )?.username);

    // Busca o entry do usuário atual para exibir mesmo fora do top-10
    const currentUser = await this.userRepository.findById(request.userId);
    const currentUserEntry: StudentLeaderboardEntry | null = currentUser
      ? {
          rank: currentUserRank,
          fullName: currentUser.fullName,
          username: currentUser.username,
          xp: currentUser.xp,
        }
      : null;

    return {
      topUsers,
      currentUserRank,
      currentUserEntry,
    };
  }
}
