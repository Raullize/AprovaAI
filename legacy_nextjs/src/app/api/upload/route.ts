import { NextResponse } from 'next/server';
import { uploadImage } from '@/actions/upload';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await uploadImage(formData);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao fazer upload' },
      { status: 400 }
    );
  }
}
