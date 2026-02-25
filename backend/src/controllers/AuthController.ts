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
      const userExists = await prisma.user.findUnique({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'E-mail já cadastrado' });
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
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao cadastrar usuário' });
    }
  }
}

export default new AuthController();
