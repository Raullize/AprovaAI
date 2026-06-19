import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { StudentController } from './student.controller';
import { UserRepository } from '../../domain/users/repositories/user.repository';
import { PrismaUserRepository } from '../../infrastructure/database/prisma/repositories/prisma-user.repository';
import { HashProvider } from '../../application/auth/ports/hash-provider';
import { BcryptHashProvider } from '../../infrastructure/providers/cryptography/bcrypt-hash.provider';
import { GetStudentProfileUseCase } from '../../application/student/use-cases/get-student-profile.use-case';
import { UpdateStudentProfileUseCase } from '../../application/student/use-cases/update-student-profile.use-case';
import { UpdateStudentPasswordUseCase } from '../../application/student/use-cases/update-student-password.use-case';
import { DeleteStudentAccountUseCase } from '../../application/student/use-cases/delete-student-account.use-case';
import { GetStudentDashboardStatsUseCase } from '../../application/student/use-cases/get-student-dashboard-stats.use-case';
import { GetStudentLeaderboardUseCase } from '../../application/student/use-cases/get-student-leaderboard.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [StudentController],
  providers: [
    GetStudentProfileUseCase,
    UpdateStudentProfileUseCase,
    UpdateStudentPasswordUseCase,
    DeleteStudentAccountUseCase,
    GetStudentDashboardStatsUseCase,
    GetStudentLeaderboardUseCase,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: HashProvider,
      useClass: BcryptHashProvider,
    },
  ],
})
export class StudentModule {}
