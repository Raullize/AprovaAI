import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { loginSchema, LoginDto } from './dto/login.dto';
import { registerSchema, RegisterDto } from './dto/register.dto';
import { LoginResponseDto, RegisterResponseDto } from './dto/auth-response.dto';
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
  @ApiOperation({
    summary: 'Login',
    description:
      'Autentica um usuário com e-mail e senha e retorna o token JWT ' +
      'juntamente com os dados do usuário.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Dados de entrada inválidos (e-mail ou senha ausentes/mal formatados).',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas ou e-mail não cadastrado.',
  })
  async login(@Body(new ZodValidationPipe(loginSchema)) loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Registrar',
    description:
      'Cria uma nova conta de estudante (role STUDENT) e retorna os dados ' +
      'do usuário recém-criado.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso.',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou e-mail/username já cadastrados.',
  })
  async register(
    @Body(new ZodValidationPipe(registerSchema)) registerDto: RegisterDto,
  ) {
    return this.registerUseCase.execute(registerDto);
  }
}
