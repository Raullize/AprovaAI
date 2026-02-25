import { NextResponse } from 'next/server';
import { getExamById, updateExam, deleteExam } from '@/actions/exams';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const exam = await getExamById(params.id);
    return NextResponse.json(exam);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const exam = await updateExam({ id: params.id, ...body });
    return NextResponse.json(exam);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteExam(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 400 }
    );
  }
}
