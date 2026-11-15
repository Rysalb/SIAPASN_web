import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = { code: category };
    }
    if (difficulty && difficulty !== 'ALL') {
      where.difficulty = difficulty;
    }
    if (search) {
      where.OR = [
        { questionText: { contains: search } },
        { explanation: { contains: search } },
      ];
    }

    const [total, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          subcategory: true,
          options: {
            orderBy: { optionLabel: 'asc' },
          },
          answers: true,
          document: {
            select: { filename: true },
          },
        },
      }),
    ]);

    const categories = await prisma.category.findMany({
      include: { subcategories: true },
    });

    return NextResponse.json({
      questions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      categories,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const {
      categoryId,
      subcategoryId,
      questionText,
      explanation,
      difficulty = 'MEDIUM',
      options, // array of { optionLabel, optionText, scoreWeight, isCorrect }
      correctAnswerLabel,
    } = body;

    if (!categoryId || !questionText || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'Kategori, teks pertanyaan, dan minimal 2 opsi jawaban wajib diisi.' },
        { status: 400 }
      );
    }

    const question = await prisma.question.create({
      data: {
        categoryId,
        subcategoryId: subcategoryId || null,
        questionText: questionText.trim(),
        explanation: explanation?.trim() || null,
        difficulty,
        status: 'PUBLISHED',
        options: {
          create: options.map((opt: any) => ({
            optionLabel: opt.optionLabel.toUpperCase(),
            optionText: opt.optionText.trim(),
            scoreWeight: parseFloat(opt.scoreWeight || 0),
            isCorrect: opt.optionLabel.toUpperCase() === correctAnswerLabel?.toUpperCase(),
          })),
        },
      },
      include: { options: true },
    });

    const correctOption =
      question.options.find((o) => o.optionLabel === correctAnswerLabel?.toUpperCase()) ||
      question.options[0];

    await prisma.questionAnswer.create({
      data: {
        questionId: question.id,
        correctOptionId: correctOption.id,
      },
    });

    return NextResponse.json({ success: true, question });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID soal wajib disertakan.' }, { status: 400 });
    }

    await prisma.question.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Soal berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}

