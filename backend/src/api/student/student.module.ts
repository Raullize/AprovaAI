import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { StudentController } from './student.controller';
import { UserRepository } from '../../domain/users/repositories/user.repository';
import { PrismaUserRepository } from '../../infrastructure/database/prisma/repositories/prisma-user.repository';
import { GetStudentDashboardStatsUseCase } from '../../application/student/use-cases/get-student-dashboard-stats.use-case';
import { GetStudentLeaderboardUseCase } from '../../application/student/use-cases/get-student-leaderboard.use-case';
import { GetStudentStreakLeaderboardUseCase } from '../../application/student/use-cases/get-student-streak-leaderboard.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [StudentController],
  providers: [
    GetStudentDashboardStatsUseCase,
    GetStudentLeaderboardUseCase,
    GetStudentStreakLeaderboardUseCase,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],
})
export class StudentModule {}
