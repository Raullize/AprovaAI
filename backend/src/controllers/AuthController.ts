import { Request, Response } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.NEXTAUTH_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      const { passwordHash: _, ...userWithoutPassword } = user;

      return res.json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno' });
    }
  }

  async register(req: Request, res: Response) {
    const { fullName, username, email, password, dateOfBirth } = req.body;

    try {
      if (!fullName || !username || !email || !password || !dateOfBirth) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
      }

      // Validações de tamanho
      if (fullName.length < 2 || fullName.length > 100) {
        return res.status(400).json({ error: 'Nome deve ter entre 2 e 100 caracteres.' });
      }
      if (username.length < 3 || username.length > 30) {
        return res.status(400).json({ error: 'Usuário deve ter entre 3 e 30 caracteres.' });
      }
      if (password.length < 6 || password.length > 50) {
        return res.status(400).json({ error: 'Senha deve ter entre 6 e 50 caracteres.' });
      }

      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
      }

      const usernameExists = await prisma.user.findUnique({ where: { username } });
      if (usernameExists) {
        return res.status(400).json({ error: 'Este nome de usuário já está em uso.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          fullName,
          username,
          email,
          passwordHash,
          dateOfBirth: new Date(dateOfBirth),
          role: 'USER',
          subscriptionPlan: 'FREE',
          xp: 0
        },
      });

      const { passwordHash: _, ...userWithoutPassword } = user;

      return res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      console.error('Register Error:', error);
      
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        if (Array.isArray(target)) {
            if (target.includes('email')) return res.status(400).json({ error: 'Este e-mail já está em uso.' });
            if (target.includes('username')) return res.status(400).json({ error: 'Este nome de usuário já está em uso.' });
        }
      }

      return res.status(500).json({ error: 'Erro interno ao cadastrar usuário.' });
    }
  }
}

export default new AuthController();
