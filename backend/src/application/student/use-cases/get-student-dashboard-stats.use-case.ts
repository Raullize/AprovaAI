import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { UserRepository } from '../../../domain/users/repositories/user.repository';

export interface GetStudentDashboardStatsRequest {
  userId: string;
  /**
   * Mês de referência no formato 'YYYY-MM'.
   * Se não informado, usa o mês atual.
   */
  month?: string;
}

export interface GetStudentDashboardStatsResponse {
  streakCount: number;
  activeDays: number[];
  /** Mês/Ano de referência retornado pelo backend (yyyy-mm) */
  month: string;
}

@Injectable()
export class GetStudentDashboardStatsUseCase implements UseCase<
  GetStudentDashboardStatsRequest,
  GetStudentDashboardStatsResponse
> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    request: GetStudentDashboardStatsRequest,
  ): Promise<GetStudentDashboardStatsResponse> {
    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      const now = new Date();
      const fallbackMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return { streakCount: 0, activeDays: [], month: fallbackMonth };
    }

    // Resolve o mês de referência
    let referenceDate: Date;
    if (request.month) {
      const [year, month] = request.month.split('-').map(Number);
      referenceDate = new Date(year, month - 1, 1);
    } else {
      referenceDate = new Date();
    }

    const activeDates =
      await this.userRepository.findActivitiesByUserIdAndMonth(
        user.id,
        referenceDate,
      );

    const monthStr = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}`;

    return {
      streakCount: user.streakCount,
      activeDays: activeDates.map((date) => date.getDate()),
      month: monthStr,
    };
  }
}
