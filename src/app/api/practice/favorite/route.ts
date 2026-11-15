import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { questionId } = await req.json();

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
    }

    const existing = await prisma.userFavorite.findUnique({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId,
        },
      },
    });

    if (existing) {
      await prisma.userFavorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isFavorited: false, message: 'Dihapus dari soal favorit.' });
    } else {
      await prisma.userFavorite.create({
        data: {
          userId: user.id,
          questionId,
        },
      });
      return NextResponse.json({ isFavorited: true, message: 'Disimpan ke soal favorit.' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const favorites = await prisma.userFavorite.findMany({
      where: { userId: user.id },
      include: {
        question: {
          include: {
            category: true,
            subcategory: true,
            options: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ favorites });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

