import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const material = await prisma.material.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        subcategory: true,
        chapters: {
          orderBy: { orderNumber: 'asc' },
        },
        progress: user
          ? {
              where: { userId: user.id },
            }
          : false,
      },
    });

    if (!material) {
      return NextResponse.json({ error: 'Materi tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ material });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const { chapterId, isCompleted } = await req.json();

    const progress = await prisma.materialProgress.upsert({
      where: {
        id: `${user.id}-${chapterId || params.id}`,
      },
      update: {
        isCompleted: Boolean(isCompleted),
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        id: `${user.id}-${chapterId || params.id}`,
        userId: user.id,
        materialId: params.id,
        chapterId: chapterId || null,
        isCompleted: Boolean(isCompleted),
        completedAt: isCompleted ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

