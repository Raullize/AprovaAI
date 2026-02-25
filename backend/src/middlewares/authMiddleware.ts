import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  role: string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const parts = authorization.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret');
    const { id, role } = decoded as TokenPayload;

    req.userId = id;
    req.userRole = role; // TypeScript pode reclamar aqui se não reconhecer o .d.ts

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
