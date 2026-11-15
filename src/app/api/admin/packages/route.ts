import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const [packages, documents, unusedCount] = await Promise.all([
      prisma.examPackage.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { questions: true, attempts: true },
          },
        },
      }),
      prisma.document.findMany({
        where: { processingStatus: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          filename: true,
          _count: { select: { questions: true } },
        },
      }),
      prisma.question.count({
        where: {
          packageLinks: { none: {} },
        },
      }),
    ]);

    return NextResponse.json({
      packages,
      documents,
      unusedQuestionsTotal: unusedCount,
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
      title,
      description,
      durationMinutes = 100,
      examType = 'SKD_COMPLETE',
      isRandomized = true,
      passingGradeTwk = 65,
      passingGradeTiu = 80,
      passingGradeTkp = 166,
      sourceType = 'DOCUMENT', // 'DOCUMENT' | 'UNUSED' | 'ALL'
      sourceDocumentId = null,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Judul paket tryout wajib diisi.' }, { status: 400 });
    }

    let questionsToLink: { id: string }[] = [];

    // 1. Source: Specific PDF Document
    if (sourceType === 'DOCUMENT' && sourceDocumentId) {
      const docQuestions = await prisma.question.findMany({
        where: { documentId: sourceDocumentId },
        select: { id: true, category: { select: { code: true } } },
        orderBy: { createdAt: 'asc' },
      });

      if (docQuestions.length === 0) {
        return NextResponse.json(
          { error: 'Berkas PDF ini belum memiliki butir soal yang diimpor.' },
          { status: 400 }
        );
      }

      questionsToLink = docQuestions;
    }
    // 2. Source: Strictly UNUSED questions (guaranteed 0 duplicates from any existing package)
    else if (sourceType === 'UNUSED') {
      if (examType === 'TWK_DRILL') {
        questionsToLink = await prisma.question.findMany({
          where: { category: { code: 'TWK' }, packageLinks: { none: {} } },
          take: 30,
          select: { id: true },
        });
      } else if (examType === 'TIU_DRILL') {
        questionsToLink = await prisma.question.findMany({
          where: { category: { code: 'TIU' }, packageLinks: { none: {} } },
          take: 35,
          select: { id: true },
        });
      } else if (examType === 'TKP_DRILL') {
        questionsToLink = await prisma.question.findMany({
          where: { category: { code: 'TKP' }, packageLinks: { none: {} } },
          take: 45,
          select: { id: true },
        });
      } else {
        // Complete SKD from unused
        const [twk, tiu, tkp] = await Promise.all([
          prisma.question.findMany({
            where: { category: { code: 'TWK' }, packageLinks: { none: {} } },
            take: 30,
            select: { id: true },
          }),
          prisma.question.findMany({
            where: { category: { code: 'TIU' }, packageLinks: { none: {} } },
            take: 35,
            select: { id: true },
          }),
          prisma.question.findMany({
            where: { category: { code: 'TKP' }, packageLinks: { none: {} } },
            take: 45,
            select: { id: true },
          }),
        ]);
        questionsToLink = [...twk, ...tiu, ...tkp];
      }

      // If unused questions are exhausted, fallback to all questions
      if (questionsToLink.length === 0) {
        return NextResponse.json(
          { error: 'Seluruh bank soal sudah digunakan di paket lain. Silakan impor PDF baru atau pilih mode acak.' },
          { status: 400 }
        );
      }
    }
    // 3. Fallback / ALL: Pick from all questions
    else {
      if (examType === 'TWK_DRILL') {
        questionsToLink = await prisma.question.findMany({
          where: { category: { code: 'TWK' } },
          take: 30,
          select: { id: true },
        });
      } else if (examType === 'TIU_DRILL') {
        questionsToLink = await prisma.question.findMany({
          where: { category: { code: 'TIU' } },
          take: 35,
          select: { id: true },
        });
      } else if (examType === 'TKP_DRILL') {
        questionsToLink = await prisma.question.findMany({
          where: { category: { code: 'TKP' } },
          take: 45,
          select: { id: true },
        });
      } else {
        const [twk, tiu, tkp] = await Promise.all([
          prisma.question.findMany({
            where: { category: { code: 'TWK' } },
            take: 30,
            select: { id: true },
          }),
          prisma.question.findMany({
            where: { category: { code: 'TIU' } },
            take: 35,
            select: { id: true },
          }),
          prisma.question.findMany({
            where: { category: { code: 'TKP' } },
            take: 45,
            select: { id: true },
          }),
        ]);
        questionsToLink = [...twk, ...tiu, ...tkp];
      }
    }

    const pkg = await prisma.examPackage.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        durationMinutes: parseInt(durationMinutes),
        examType,
        totalQuestions: questionsToLink.length,
        isRandomized: Boolean(isRandomized),
        passingGradeTwk: parseFloat(passingGradeTwk),
        passingGradeTiu: parseFloat(passingGradeTiu),
        passingGradeTkp: parseFloat(passingGradeTkp),
        status: 'PUBLISHED',
        questions: {
          create: questionsToLink.map((q, idx) => ({
            questionId: q.id,
            orderNumber: idx + 1,
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      package: pkg,
      totalLinkedQuestions: questionsToLink.length,
      message: `Paket berhasil dibuat dengan ${questionsToLink.length} butir soal unik.`,
    });
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
      return NextResponse.json({ error: 'ID paket wajib disertakan.' }, { status: 400 });
    }

    await prisma.examPackage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Paket berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}
