import { NextResponse } from 'next/server';
import { registerUser } from '@/actions/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newUser = await registerUser(body);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao cadastrar usuário' },
      { status: 400 }
    );
  }
}
