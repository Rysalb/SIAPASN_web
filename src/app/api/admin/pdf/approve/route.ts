import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const {
      documentId,
      approvedQuestions,
      isFirstBatch = true,
      isLastBatch = true,
      totalQuestions = approvedQuestions?.length || 0,
    } = await req.json();

    if (!documentId || !Array.isArray(approvedQuestions) || approvedQuestions.length === 0) {
      return NextResponse.json(
        { error: 'Data soal yang disetujui tidak valid atau kosong.' },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: 'Dokumen tidak ditemukan.' }, { status: 404 });
    }

    if (isFirstBatch) {
      await prisma.document.update({
        where: { id: document.id },
        data: { processingStatus: 'PROCESSING' },
      });
    }

    // Cache categories & subcategories
    const categories = await prisma.category.findMany({
      include: { subcategories: true },
    });

    // Pre-create any missing subcategories to prevent race conditions in Promise.all
    for (const q of approvedQuestions) {
      const cat = categories.find((c) => c.code === q.categoryCode) || categories[0];
      if (q.subcategoryName && !cat.subcategories.some((s) => s.name.toLowerCase() === q.subcategoryName.toLowerCase())) {
        const newSub = await prisma.subcategory.create({
          data: {
            categoryId: cat.id,
            name: q.subcategoryName,
          },
        });
        cat.subcategories.push(newSub);
      }
    }

    // Process questions in parallel batches for speed
    let successCount = 0;

    await Promise.all(
      approvedQuestions.map(async (q: any) => {
        try {
          const cat = categories.find((c) => c.code === q.categoryCode) || categories[0];
          const sub = cat.subcategories.find(
            (s) => s.name.toLowerCase() === (q.subcategoryName || '').toLowerCase()
          );

          const createdQuestion = await prisma.question.create({
            data: {
              categoryId: cat.id,
              subcategoryId: sub ? sub.id : null,
              documentId: document.id,
              questionText: q.questionText,
              explanation: q.explanation || 'Pembahasan kunci jawaban standar.',
              difficulty: q.difficulty || 'MEDIUM',
              status: 'PUBLISHED',
              options: {
                create: (q.options || []).map((opt: any) => ({
                  optionLabel: (opt.label || 'A').toUpperCase(),
                  optionText: opt.text || '',
                  scoreWeight:
                    opt.scoreWeight !== undefined
                      ? opt.scoreWeight
                      : opt.label === q.correctAnswer
                      ? 5
                      : 0,
                  isCorrect: opt.label === q.correctAnswer,
                })),
              },
            },
            include: { options: true },
          });

          const correctOpt =
            createdQuestion.options.find((o) => o.optionLabel === q.correctAnswer) ||
            createdQuestion.options[0];

          if (correctOpt) {
            await prisma.questionAnswer.create({
              data: {
                questionId: createdQuestion.id,
                correctOptionId: correctOpt.id,
              },
            });
          }

          successCount++;
        } catch (itemErr) {
          console.error('Failed to import question item:', itemErr);
        }
      })
    );

    // If this is the last batch, finalize document status and create import log
    if (isLastBatch) {
      await prisma.document.update({
        where: { id: document.id },
        data: {
          processingStatus: 'COMPLETED',
          processedAt: new Date(),
        },
      });

      await prisma.documentImport.create({
        data: {
          documentId: document.id,
          totalExtracted: totalQuestions,
          totalSuccess: successCount,
          totalFailed: 0,
          totalApproved: totalQuestions,
          importStatus: 'COMPLETED',
        },
      });
    }

    return NextResponse.json({
      success: true,
      importedBatchCount: successCount,
      isLastBatch,
      message: isLastBatch
        ? `Berhasil menyelesaikan impor ${totalQuestions} butir soal ke dalam Bank Soal.`
        : `Berhasil mengimpor batch ${successCount} butir soal.`,
    });
  } catch (error: any) {
    console.error('Approve import error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menyetujui dan mengimpor soal.' },
      { status: 500 }
    );
  }
}
