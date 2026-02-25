import { NextResponse } from 'next/server';
import { getTopicById, updateTopic, deleteTopic } from '@/actions/topics';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const topic = await getTopicById(params.id);
    return NextResponse.json(topic);
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
    const topic = await updateTopic({ id: params.id, ...body });
    return NextResponse.json(topic);
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
    await deleteTopic(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 400 }
    );
  }
}
