import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { LoginUseCase } from '../../application/auth/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/auth/use-cases/register.use-case';
import { UserRepository } from '../../domain/users/repositories/user.repository';
import { PrismaUserRepository } from '../../infrastructure/database/prisma/repositories/prisma-user.repository';
import { HashProvider } from '../../application/auth/ports/hash-provider';
import { BcryptHashProvider } from '../../infrastructure/providers/cryptography/bcrypt-hash.provider';
import { TokenProvider } from '../../application/auth/ports/token-provider';
import { JwtTokenProvider } from '../../infrastructure/providers/tokens/jwt-token.provider';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: HashProvider,
      useClass: BcryptHashProvider,
    },
    {
      provide: TokenProvider,
      useClass: JwtTokenProvider,
    },
  ],
  exports: [TokenProvider],
})
export class AuthModule {}
