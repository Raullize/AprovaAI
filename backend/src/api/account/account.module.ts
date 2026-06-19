import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { AccountController } from './account.controller';
import { UserRepository } from '../../domain/users/repositories/user.repository';
import { PrismaUserRepository } from '../../infrastructure/database/prisma/repositories/prisma-user.repository';
import { HashProvider } from '../../application/auth/ports/hash-provider';
import { BcryptHashProvider } from '../../infrastructure/providers/cryptography/bcrypt-hash.provider';
import { GetAccountProfileUseCase } from '../../application/account/use-cases/get-account-profile.use-case';
import { UpdateAccountProfileUseCase } from '../../application/account/use-cases/update-account-profile.use-case';
import { UpdateAccountPasswordUseCase } from '../../application/account/use-cases/update-account-password.use-case';
import { DeleteAccountUseCase } from '../../application/account/use-cases/delete-account.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [AccountController],
  providers: [
    GetAccountProfileUseCase,
    UpdateAccountProfileUseCase,
    UpdateAccountPasswordUseCase,
    DeleteAccountUseCase,
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
export class AccountModule {}
