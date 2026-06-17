import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { loginSchema, LoginDto } from './dto/login.dto';
import { registerSchema, RegisterDto } from './dto/register.dto';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { LoginUseCase } from '../../application/auth/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/auth/use-cases/register.use-case';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login', description: 'Autentica um usuário e retorna o token JWT.' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso.' })
  async login(@Body(new ZodValidationPipe(loginSchema)) loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar', description: 'Cria uma nova conta de usuário (Aluno).' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso.' })
  async register(
    @Body(new ZodValidationPipe(registerSchema)) registerDto: RegisterDto,
  ) {
    return this.registerUseCase.execute(registerDto);
  }
}
