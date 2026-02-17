import { NextResponse } from 'next/server';
import { getExams, createExam } from '@/actions/exams';

export async function GET() {
  try {
    const exams = await getExams();
    return NextResponse.json(exams);
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
    const exam = await createExam(body);
    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 400 }
    );
  }
}
