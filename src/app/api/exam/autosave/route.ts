import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { attemptId, questionId, selectedOptionId, isMarked } = await req.json();

    if (!attemptId || !questionId) {
      return NextResponse.json({ error: 'Attempt ID and Question ID required' }, { status: 400 });
    }

    const attempt = await prisma.examAttempt.findFirst({
      where: {
        id: attemptId,
        userId: user.id,
        status: 'IN_PROGRESS',
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Sesi ujian tidak valid atau telah berakhir.' }, { status: 403 });
    }

    // Check if time expired
    if (new Date() > new Date(attempt.expiresAt)) {
      return NextResponse.json({ error: 'Waktu ujian telah habis.', isExpired: true }, { status: 410 });
    }

    // Upsert answer
    const existing = await prisma.examAnswer.findFirst({
      where: {
        attemptId,
        questionId,
      },
    });

    if (existing) {
      await prisma.examAnswer.update({
        where: { id: existing.id },
        data: {
          selectedOptionId: selectedOptionId ?? existing.selectedOptionId,
          isMarked: typeof isMarked === 'boolean' ? isMarked : existing.isMarked,
          answeredAt: new Date(),
        },
      });
    } else {
      await prisma.examAnswer.create({
        data: {
          attemptId,
          questionId,
          selectedOptionId: selectedOptionId || null,
          isMarked: Boolean(isMarked),
          answeredAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}

