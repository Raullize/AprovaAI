import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { UserRepository } from '../../../domain/users/repositories/user.repository';

export interface GetStudentDashboardStatsRequest {
  userId: string;
}

export interface GetStudentDashboardStatsResponse {
  streakCount: number;
  activeDays: number[];
}

@Injectable()
export class GetStudentDashboardStatsUseCase
  implements
    UseCase<
      GetStudentDashboardStatsRequest,
      GetStudentDashboardStatsResponse
    >
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    request: GetStudentDashboardStatsRequest,
  ): Promise<GetStudentDashboardStatsResponse> {
    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      return { streakCount: 0, activeDays: [] };
    }

    const today = new Date();
    const activeDates = await this.userRepository.findActivitiesByUserIdAndMonth(
      user.id,
      today,
    );

    return {
      streakCount: user.streakCount,
      activeDays: activeDates.map((date) => date.getDate()),
    };
  }
}
