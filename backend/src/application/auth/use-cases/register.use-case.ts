import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../shared/core/use-case';
import { UserRepository } from '../../../domain/users/repositories/user.repository';
import { HashProvider } from '../ports/hash-provider';
import { UserAlreadyExistsError } from '../../../domain/users/errors/user-already-exists.error';
import { User } from '../../../domain/users/entities/user.entity';
import { RegisterDto } from '../../../api/auth/dto/register.dto';

export interface RegisterResponse {
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
}

@Injectable()
export class RegisterUseCase implements UseCase<RegisterDto, RegisterResponse> {
  constructor(
    private userRepository: UserRepository,
    private hashProvider: HashProvider,
  ) {}

  async execute(request: RegisterDto): Promise<RegisterResponse> {
    const emailExists = await this.userRepository.findByEmail(request.email);
    if (emailExists) {
      throw new UserAlreadyExistsError('email');
    }

    const usernameExists = await this.userRepository.findByUsername(
      request.username,
    );
    if (usernameExists) {
      throw new UserAlreadyExistsError('username');
    }

    const passwordHash = await this.hashProvider.hash(request.password);

    const user = User.create({
      fullName: request.fullName,
      username: request.username,
      email: request.email,
      passwordHash,
      dateOfBirth: new Date(request.dateOfBirth),
    });

    const savedUser = await this.userRepository.create(user);

    return {
      id: savedUser.id,
      fullName: savedUser.fullName,
      username: savedUser.username,
      email: savedUser.email,
      dateOfBirth: savedUser.dateOfBirth,
      role: savedUser.role,
      subscriptionPlan: savedUser.subscriptionPlan,
      xp: savedUser.xp,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }
}
