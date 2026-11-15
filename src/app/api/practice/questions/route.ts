import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const difficulty = searchParams.get('difficulty');
    const count = parseInt(searchParams.get('count') || '10');

    const where: any = { status: 'PUBLISHED' };
    if (category && category !== 'ALL') {
      where.category = { code: category };
    }
    if (subcategory && subcategory !== 'ALL') {
      where.subcategoryId = subcategory;
    }
    if (difficulty && difficulty !== 'ALL') {
      where.difficulty = difficulty;
    }

    const allMatching = await prisma.question.findMany({
      where,
      include: {
        category: true,
        subcategory: true,
        options: {
          orderBy: { optionLabel: 'asc' },
        },
        favorites: user ? { where: { userId: user.id } } : false,
      },
    });

    // Shuffle questions
    const shuffled = [...allMatching].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    const formatted = selected.map((q) => {
      const correctOpt = q.options.find((o) => o.isCorrect) || q.options[0];
      return {
        id: q.id,
        category: q.category.code,
        categoryName: q.category.name,
        subcategory: q.subcategory?.name || 'Umum',
        difficulty: q.difficulty,
        questionText: q.questionText,
        explanation: q.explanation,
        options: q.options.map((o) => ({
          id: o.id,
          label: o.optionLabel,
          text: o.optionText,
          scoreWeight: o.scoreWeight,
          isCorrect: o.isCorrect,
        })),
        correctOptionId: correctOpt.id,
        correctLabel: correctOpt.optionLabel,
        isFavorited: Boolean(q.favorites && q.favorites.length > 0),
      };
    });

    return NextResponse.json({ questions: formatted, totalAvailable: allMatching.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

