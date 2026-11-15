import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const user = await getCurrentUser();
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: params.attemptId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        examPackage: {
          include: {
            questions: {
              include: {
                question: {
                  include: {
                    category: true,
                    subcategory: true,
                    options: {
                      orderBy: { optionLabel: 'asc' },
                    },
                    favorites: user ? { where: { userId: user.id } } : false,
                  },
                },
              },
              orderBy: { orderNumber: 'asc' },
            },
          },
        },
        answers: {
          include: {
            selectedOption: true,
          },
        },
        result: true,
      },
    });

    if (!attempt || !attempt.result) {
      return NextResponse.json({ error: 'Hasil ujian belum tersedia atau tidak ditemukan.' }, { status: 404 });
    }

    const answerMap: Record<string, any> = {};
    attempt.answers.forEach((ans) => {
      answerMap[ans.questionId] = ans;
    });

    const detailedQuestions = attempt.examPackage.questions.map((pq, idx) => {
      const q = pq.question;
      const ans = answerMap[q.id];
      const selectedOption = ans ? ans.selectedOption : null;
      const correctOption = q.options.find((o) => o.isCorrect) || q.options[0];

      let pointsEarned = 0;
      if (q.category.code === 'TKP') {
        pointsEarned = selectedOption?.scoreWeight ?? 0;
      } else {
        pointsEarned = selectedOption?.isCorrect ? 5 : 0;
      }

      return {
        number: idx + 1,
        questionId: q.id,
        categoryCode: q.category.code,
        categoryName: q.category.name,
        subcategoryName: q.subcategory?.name || 'Umum',
        questionText: q.questionText,
        explanation: q.explanation || 'Pembahasan standar BKN.',
        options: q.options.map((o) => ({
          id: o.id,
          label: o.optionLabel,
          text: o.optionText,
          scoreWeight: o.scoreWeight,
          isCorrect: o.isCorrect,
        })),
        userAnswer: selectedOption
          ? {
              id: selectedOption.id,
              label: selectedOption.optionLabel,
              text: selectedOption.optionText,
            }
          : null,
        correctAnswer: {
          id: correctOption.id,
          label: correctOption.optionLabel,
          text: correctOption.optionText,
        },
        pointsEarned,
        isFavorited: Boolean(q.favorites && q.favorites.length > 0),
      };
    });

    // Subcategory weakness analysis
    const subcategoryStats: Record<string, { total: number; correct: number }> = {};
    detailedQuestions.forEach((dq) => {
      const key = `${dq.categoryCode}: ${dq.subcategoryName}`;
      if (!subcategoryStats[key]) {
        subcategoryStats[key] = { total: 0, correct: 0 };
      }
      subcategoryStats[key].total++;
      if (dq.pointsEarned === 5) {
        subcategoryStats[key].correct++;
      }
    });

    const weakTopics = Object.entries(subcategoryStats)
      .map(([topic, stat]) => ({
        topic,
        accuracy: Math.round((stat.correct / stat.total) * 100),
        total: stat.total,
      }))
      .filter((s) => s.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy);

    return NextResponse.json({
      attemptId: attempt.id,
      participantName: attempt.user.name,
      packageName: attempt.examPackage.title,
      durationMinutes: attempt.examPackage.durationMinutes,
      startedAt: attempt.startedAt,
      endedAt: attempt.endedAt,
      passingGradeTwk: attempt.examPackage.passingGradeTwk,
      passingGradeTiu: attempt.examPackage.passingGradeTiu,
      passingGradeTkp: attempt.examPackage.passingGradeTkp,
      result: attempt.result,
      weakTopics,
      questions: detailedQuestions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

