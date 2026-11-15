import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const attempts = await prisma.examAttempt.findMany({
      where: {
        userId: user.id,
        status: 'COMPLETED',
      },
      include: {
        examPackage: {
          select: {
            id: true,
            title: true,
            durationMinutes: true,
            passingGradeTwk: true,
            passingGradeTiu: true,
            passingGradeTkp: true,
          },
        },
        result: true,
      },
      orderBy: { endedAt: 'desc' },
    });

    return NextResponse.json({ attempts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

