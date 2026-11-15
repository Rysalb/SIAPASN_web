import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    const packages = await prisma.examPackage.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { questions: true } },
        attempts: user
          ? {
              where: { userId: user.id },
              orderBy: { createdAt: 'desc' },
              include: { result: true },
            }
          : false,
      },
    });

    return NextResponse.json({ packages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

