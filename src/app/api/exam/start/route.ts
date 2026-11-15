import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { packageId } = await req.json();

    if (!packageId) {
      return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
    }

    const examPkg = await prisma.examPackage.findUnique({
      where: { id: packageId },
      include: {
        questions: {
          include: {
            question: {
              include: {
                category: true,
                subcategory: true,
                options: {
                  orderBy: { optionLabel: 'asc' },
                  select: {
                    id: true,
                    questionId: true,
                    optionLabel: true,
                    optionText: true,
                    // Note: do NOT select isCorrect or scoreWeight for security during exam!
                  },
                },
              },
            },
          },
          orderBy: { orderNumber: 'asc' },
        },
      },
    });

    if (!examPkg) {
      return NextResponse.json({ error: 'Paket ujian tidak ditemukan.' }, { status: 404 });
    }

    // Check for an active session
    let attempt = await prisma.examAttempt.findFirst({
      where: {
        userId: user.id,
        examPackageId: examPkg.id,
        status: 'IN_PROGRESS',
        expiresAt: { gt: new Date() },
      },
      include: {
        answers: true,
      },
    });

    if (!attempt) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + examPkg.durationMinutes * 60 * 1000);

      attempt = await prisma.examAttempt.create({
        data: {
          userId: user.id,
          examPackageId: examPkg.id,
          startedAt: now,
          expiresAt: expiresAt,
          status: 'IN_PROGRESS',
        },
        include: {
          answers: true,
        },
      });
    }

    // Prepare questions list
    let formattedQuestions = examPkg.questions.map((pq, idx) => ({
      index: idx + 1,
      id: pq.question.id,
      categoryCode: pq.question.category.code,
      categoryName: pq.question.category.name,
      subcategoryName: pq.question.subcategory?.name || 'Umum',
      difficulty: pq.question.difficulty,
      questionText: pq.question.questionText,
      options: pq.question.options.map((opt) => ({
        id: opt.id,
        label: opt.optionLabel,
        text: opt.optionText,
      })),
    }));

    if (examPkg.isRandomized) {
      // Shuffled using attempt ID as seed or standard shuffle
      // For consistency, we keep the order predictable for this attempt
    }

    // Existing saved answers map
    const savedAnswers: Record<string, { selectedOptionId: string | null; isMarked: boolean }> = {};
    attempt.answers.forEach((ans) => {
      savedAnswers[ans.questionId] = {
        selectedOptionId: ans.selectedOptionId,
        isMarked: ans.isMarked,
      };
    });

    // Time remaining in seconds
    const nowMs = Date.now();
    const expiresMs = new Date(attempt.expiresAt).getTime();
    const remainingSeconds = Math.max(0, Math.floor((expiresMs - nowMs) / 1000));

    return NextResponse.json({
      attemptId: attempt.id,
      package: {
        id: examPkg.id,
        title: examPkg.title,
        durationMinutes: examPkg.durationMinutes,
        totalQuestions: formattedQuestions.length,
        passingGradeTwk: examPkg.passingGradeTwk,
        passingGradeTiu: examPkg.passingGradeTiu,
        passingGradeTkp: examPkg.passingGradeTkp,
      },
      remainingSeconds,
      questions: formattedQuestions,
      savedAnswers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

