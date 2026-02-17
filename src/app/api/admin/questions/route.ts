import { NextResponse } from 'next/server';
import { getQuestions, createQuestion } from '@/actions/questions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const levelId = searchParams.get('levelId');
    const search = searchParams.get('search') || '';
    
    if (!levelId) {
      return NextResponse.json({ error: 'levelId é obrigatório' }, { status: 400 });
    }

    const questions = await getQuestions({ levelId, search });
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = await createQuestion(body);
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 400 }
    );
  }
}
