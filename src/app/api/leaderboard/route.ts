import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get('packageId');

    const where: any = {
      status: 'COMPLETED',
      result: { isNot: null },
    };

    if (packageId && packageId !== 'ALL') {
      where.examPackageId = packageId;
    }

    const attempts = await prisma.examAttempt.findMany({
      where,
      orderBy: {
        totalScore: 'desc',
      },
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            profile: {
              select: { province: true },
            },
          },
        },
        examPackage: {
          select: { title: true },
        },
        result: true,
      },
    });

    const packages = await prisma.examPackage.findMany({
      select: { id: true, title: true },
    });

    const rankings = attempts.map((a, idx) => ({
      rank: idx + 1,
      attemptId: a.id,
      userName: a.user.name,
      userAvatar: a.user.avatar,
      province: a.user.profile?.province || 'Nasional',
      packageTitle: a.examPackage.title,
      twkScore: a.result?.twkScore || 0,
      tiuScore: a.result?.tiuScore || 0,
      tkpScore: a.result?.tkpScore || 0,
      totalScore: a.totalScore || 0,
      isPassed: a.result?.isPassed || false,
      completedAt: a.endedAt,
    }));

    return NextResponse.json({ rankings, packages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

