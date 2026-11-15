import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: {
          select: { name: true, email: true },
        },
        materials: {
          select: { id: true, title: true, createdAt: true },
        },
        _count: {
          select: { questions: true, materials: true },
        },
      },
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

