import { NextResponse } from 'next/server';
import { getLevelById, updateLevel, deleteLevel } from '@/actions/levels';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const level = await getLevelById(params.id);
    return NextResponse.json(level);
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
    const level = await updateLevel({ id: params.id, ...body });
    return NextResponse.json(level);
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
    await deleteLevel(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 400 }
    );
  }
}
