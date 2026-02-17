import { NextResponse } from 'next/server';
import { getQuestionById, updateQuestion, deleteQuestion } from '@/actions/questions';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const question = await getQuestionById(params.id);
    return NextResponse.json(question);
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
    const question = await updateQuestion({ id: params.id, ...body });
    return NextResponse.json(question);
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
    await deleteQuestion(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 400 }
    );
  }
}
