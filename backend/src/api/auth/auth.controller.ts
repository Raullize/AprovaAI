import { Controller, Post, Body } from '@nestjs/common';
import { loginSchema } from './dto/login.dto';
import type { LoginDto } from './dto/login.dto';
import { registerSchema } from './dto/register.dto';
import type { RegisterDto } from './dto/register.dto';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { LoginUseCase } from '../../application/auth/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/auth/use-cases/register.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  @Post('login')
  async login(@Body(new ZodValidationPipe(loginSchema)) loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) registerDto: RegisterDto,
  ) {
    return this.registerUseCase.execute(registerDto);
  }
}
