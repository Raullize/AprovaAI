import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { UserRepository } from '../../../domain/users/repositories/user.repository';
import { HashProvider } from '../ports/hash-provider';
import { TokenProvider } from '../ports/token-provider';
import { InvalidCredentialsError } from '../../../domain/users/errors/invalid-credentials.error';
import { LoginDto } from '../../../api/auth/dto/login.dto';

export interface LoginResponse {
  user: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    dateOfBirth: Date;
    role: string;
    subscriptionPlan: string;
    xp: number;
    createdAt?: Date;
    updatedAt?: Date;
  };
  token: string;
}

@Injectable()
export class LoginUseCase implements UseCase<LoginDto, LoginResponse> {
  constructor(
    private userRepository: UserRepository,
    private hashProvider: HashProvider,
    private tokenProvider: TokenProvider,
  ) {}

  async execute(request: LoginDto): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(request.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isValidPassword = await this.hashProvider.compare(
      request.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      throw new InvalidCredentialsError();
    }

    const payload = { id: user.id, role: user.role };
    const token = this.tokenProvider.sign(payload);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        xp: user.xp,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }
}
