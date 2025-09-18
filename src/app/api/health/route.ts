import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Teste básico de conectividade com banco
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'OK',
      message: 'Servidor e banco funcionando!',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'Problema de conectividade com o banco de dados',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 503 });
  }
}
