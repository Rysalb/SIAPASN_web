import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { attemptId } = await req.json();

    if (!attemptId) {
      return NextResponse.json({ error: 'Attempt ID required' }, { status: 400 });
    }

    const attempt = await prisma.examAttempt.findFirst({
      where: {
        id: attemptId,
        userId: user.id,
      },
      include: {
        result: true,
        examPackage: {
          include: {
            questions: {
              include: {
                question: {
                  include: {
                    category: true,
                    subcategory: true,
                    options: true,
                  },
                },
              },
            },
          },
        },
        answers: {
          include: {
            selectedOption: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Sesi ujian tidak ditemukan.' }, { status: 404 });
    }

    if (attempt.status === 'COMPLETED' && attempt.result) {
      return NextResponse.json({ success: true, result: attempt.result });
    }

    const pkg = attempt.examPackage;
    let twkScore = 0;
    let tiuScore = 0;
    let tkpScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const answerMap: Record<string, any> = {};
    attempt.answers.forEach((a) => {
      answerMap[a.questionId] = a;
    });

    for (const pq of pkg.questions) {
      const q = pq.question;
      const ans = answerMap[q.id];
      const categoryCode = q.category.code;

      if (!ans || !ans.selectedOptionId) {
        unansweredCount++;
        continue;
      }

      const selectedOpt = q.options.find((o) => o.id === ans.selectedOptionId);

      if (categoryCode === 'TKP') {
        // TKP has weight 1 to 5
        const weight = selectedOpt?.scoreWeight ?? 1;
        tkpScore += weight;
        if (weight === 5) correctCount++;
        else incorrectCount++;
      } else {
        // TWK / TIU
        const isCorrect = selectedOpt?.isCorrect ?? false;
        if (isCorrect) {
          correctCount++;
          if (categoryCode === 'TWK') twkScore += 5;
          if (categoryCode === 'TIU') tiuScore += 5;
        } else {
          incorrectCount++;
        }
      }
    }

    const totalScore = twkScore + tiuScore + tkpScore;
    const isPassed =
      twkScore >= pkg.passingGradeTwk &&
      tiuScore >= pkg.passingGradeTiu &&
      tkpScore >= pkg.passingGradeTkp;

    // Create or update result
    const result = await prisma.examResult.upsert({
      where: { attemptId: attempt.id },
      update: {
        twkScore,
        tiuScore,
        tkpScore,
        totalScore,
        isPassed,
        correctCount,
        incorrectCount,
        unansweredCount,
      },
      create: {
        attemptId: attempt.id,
        twkScore,
        tiuScore,
        tkpScore,
        totalScore,
        isPassed,
        correctCount,
        incorrectCount,
        unansweredCount,
      },
    });

    await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        totalScore,
      },
    });

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        packageTitle: pkg.title,
        passingGradeTwk: pkg.passingGradeTwk,
        passingGradeTiu: pkg.passingGradeTiu,
        passingGradeTkp: pkg.passingGradeTkp,
      },
    });
  } catch (error: any) {
    console.error('Submit exam error:', error);
    return NextResponse.json({ error: error.message || 'Error submitting exam' }, { status: 500 });
  }
}

