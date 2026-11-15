import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = { status: 'PUBLISHED' };
    if (category && category !== 'ALL') {
      where.category = { code: category };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [categories, materials] = await Promise.all([
      prisma.category.findMany({
        include: {
          subcategories: true,
          _count: { select: { materials: true } },
        },
      }),
      prisma.material.findMany({
        where,
        orderBy: { orderNumber: 'asc' },
        include: {
          category: true,
          subcategory: true,
          chapters: {
            select: { id: true, title: true, orderNumber: true },
            orderBy: { orderNumber: 'asc' },
          },
          progress: user
            ? {
                where: { userId: user.id },
                select: { chapterId: true, isCompleted: true },
              }
            : false,
        },
      }),
    ]);

    return NextResponse.json({ categories, materials });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

