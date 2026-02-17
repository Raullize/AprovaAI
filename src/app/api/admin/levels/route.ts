import { NextResponse } from 'next/server';
import { getLevels, createLevel } from '@/actions/levels';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    const search = searchParams.get('search') || '';
    
    if (!topicId) {
      return NextResponse.json({ error: 'topicId é obrigatório' }, { status: 400 });
    }

    const levels = await getLevels({ topicId, search });
    return NextResponse.json(levels);
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
    const level = await createLevel(body);
    return NextResponse.json(level, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 400 }
    );
  }
}
