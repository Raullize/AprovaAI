import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    async login(loginDto: LoginDto) {
        const user = await this.prisma.user.findUnique({ where: { email: loginDto.email } });

        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const isValidPassword = await bcrypt.compare(loginDto.password, user.passwordHash);

        if (!isValidPassword) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const payload = { id: user.id, role: user.role };

        // We can use the ConfigService, but since we are doing a quick port:
        const token = this.jwtService.sign(payload);

        const { passwordHash: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token,
        };
    }

    async register(registerDto: RegisterDto) {
        try {
            const emailExists = await this.prisma.user.findUnique({ where: { email: registerDto.email } });
            if (emailExists) {
                throw new BadRequestException('Este e-mail já está em uso.');
            }

            const usernameExists = await this.prisma.user.findUnique({ where: { username: registerDto.username } });
            if (usernameExists) {
                throw new BadRequestException('Este nome de usuário já está em uso.');
            }

            const passwordHash = await bcrypt.hash(registerDto.password, 10);

            const user = await this.prisma.user.create({
                data: {
                    fullName: registerDto.fullName,
                    username: registerDto.username,
                    email: registerDto.email,
                    passwordHash,
                    dateOfBirth: new Date(registerDto.dateOfBirth),
                    role: 'USER',
                    subscriptionPlan: 'FREE',
                    xp: 0
                },
            });

            const { passwordHash: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error: any) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            if (error.code === 'P2002') {
                const target = error.meta?.target;
                if (Array.isArray(target)) {
                    if (target.includes('email')) throw new BadRequestException('Este e-mail já está em uso.');
                    if (target.includes('username')) throw new BadRequestException('Este nome de usuário já está em uso.');
                }
            }

            throw new InternalServerErrorException('Erro interno ao cadastrar usuário.');
        }
    }
}
