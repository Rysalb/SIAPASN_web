import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const [
      attempts,
      totalMaterials,
      completedChapters,
      favoritesCount,
      recentPackages,
    ] = await Promise.all([
      prisma.examAttempt.findMany({
        where: { userId: user.id, status: 'COMPLETED' },
        include: {
          result: true,
          examPackage: { select: { title: true } },
        },
        orderBy: { endedAt: 'desc' },
      }),
      prisma.material.count(),
      prisma.materialProgress.count({
        where: { userId: user.id, isCompleted: true },
      }),
      prisma.userFavorite.count({
        where: { userId: user.id },
      }),
      prisma.examPackage.findMany({
        where: { status: 'PUBLISHED' },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { questions: true } },
        },
      }),
    ]);

    // Calculate score metrics
    const completedAttempts = attempts.filter((a) => a.result);
    let highestScore = 0;
    let totalScoreSum = 0;
    let passedCount = 0;

    let twkScores: number[] = [];
    let tiuScores: number[] = [];
    let tkpScores: number[] = [];

    completedAttempts.forEach((a) => {
      const score = a.result?.totalScore || 0;
      if (score > highestScore) highestScore = score;
      totalScoreSum += score;
      if (a.result?.isPassed) passedCount++;

      if (a.result) {
        twkScores.push(a.result.twkScore);
        tiuScores.push(a.result.tiuScore);
        tkpScores.push(a.result.tkpScore);
      }
    });

    const averageScore = completedAttempts.length > 0
      ? Math.round(totalScoreSum / completedAttempts.length)
      : 0;

    const avgTwk = twkScores.length > 0 ? Math.round(twkScores.reduce((a, b) => a + b, 0) / twkScores.length) : 0;
    const avgTiu = tiuScores.length > 0 ? Math.round(tiuScores.reduce((a, b) => a + b, 0) / tiuScores.length) : 0;
    const avgTkp = tkpScores.length > 0 ? Math.round(tkpScores.reduce((a, b) => a + b, 0) / tkpScores.length) : 0;

    // Diagnostic recommendation
    let weakCategory = 'TWK';
    let recommendation = 'Perbanyak latihan soal hafalan pasal UUD 1945 dan sejarah nasional.';

    if (completedAttempts.length > 0) {
      const twkPercent = (avgTwk / 150) * 100;
      const tiuPercent = (avgTiu / 175) * 100;
      const tkpPercent = (avgTkp / 225) * 100;

      if (twkPercent <= tiuPercent && twkPercent <= tkpPercent) {
        weakCategory = 'TWK';
        recommendation = 'Nilai TWK kamu masih di bawah target passing grade (65). Tingkatkan pemahaman 45 butir Pancasila dan Amandemen UUD 1945.';
      } else if (tiuPercent <= twkPercent && tiuPercent <= tkpPercent) {
        weakCategory = 'TIU';
        recommendation = 'Nilai TIU kamu masih memerlukan peningkatan. Latih kecepatan berhitung deret angka dan logika silogisme.';
      } else {
        weakCategory = 'TKP';
        recommendation = 'Nilai TKP kamu bisa lebih optimal. Pilih opsi yang paling solutif, proaktif, dan berorientasi pelayanan publik.';
      }
    }

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      stats: {
        totalAttempts: completedAttempts.length,
        highestScore,
        averageScore,
        passedCount,
        completedChapters,
        totalMaterials,
        favoritesCount,
        categoryAverages: {
          twk: avgTwk,
          tiu: avgTiu,
          tkp: avgTkp,
        },
        analysis: {
          weakCategory,
          recommendation,
        },
      },
      recentAttempts: completedAttempts.slice(0, 5),
      recommendedPackages: recentPackages,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}

