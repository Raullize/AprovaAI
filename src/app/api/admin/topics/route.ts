import { NextResponse } from 'next/server';
import { getTopics, createTopic } from '@/actions/topics';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const search = searchParams.get('search') || '';
    
    if (!examId) {
      return NextResponse.json({ error: 'examId é obrigatório' }, { status: 400 });
    }

    const topics = await getTopics({ examId, search });
    return NextResponse.json(topics);
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
    const topic = await createTopic(body);
    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 400 }
    );
  }
}
