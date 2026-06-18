import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { StudentController } from './student.controller';
import { UserRepository } from '../../domain/users/repositories/user.repository';
import { PrismaUserRepository } from '../../infrastructure/database/prisma/repositories/prisma-user.repository';
import { HashProvider } from '../../application/auth/ports/hash-provider';
import { BcryptHashProvider } from '../../infrastructure/providers/cryptography/bcrypt-hash.provider';

@Module({
  imports: [PrismaModule],
  controllers: [StudentController],
  providers: [
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
