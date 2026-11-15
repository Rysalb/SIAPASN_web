import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { parsePdfBuffer } from '@/lib/pdf-parser';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File PDF wajib diunggah.' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Format berkas harus berupa PDF.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to public uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const safeFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadsDir, safeFilename);
    fs.writeFileSync(filePath, buffer);

    // Parse with our high-accuracy PDF engine
    let parseResult;
    try {
      parseResult = await parsePdfBuffer(buffer, file.name);
    } catch (parseErr: any) {
      console.error('PDF parsing error:', parseErr);
      const failedDoc = await prisma.document.create({
        data: {
          filename: file.name,
          storagePath: `/uploads/${safeFilename}`,
          fileSize: buffer.length,
          totalPages: 1,
          documentType: 'SOAL',
          processingStatus: 'FAILED',
          processingError: parseErr.message || 'Gagal membaca format PDF',
          uploadedById: admin.id,
        },
      });
      return NextResponse.json(
        {
          error: 'Gagal mengekstrak teks dari PDF. Berkas mungkin berupa hasil pindaian/scan murni atau terenkripsi.',
          documentId: failedDoc.id,
        },
        { status: 422 }
      );
    }

    // Save document with 'REVIEW' status and store JSON of extracted questions
    const doc = await prisma.document.create({
      data: {
        filename: file.name,
        storagePath: `/uploads/${safeFilename}`,
        fileSize: buffer.length,
        totalPages: parseResult.totalPages,
        documentType: parseResult.documentType,
        processingStatus: 'REVIEW',
        extractedData: JSON.stringify(parseResult.questions),
        uploadedById: admin.id,
      },
    });

    return NextResponse.json({
      success: true,
      documentId: doc.id,
      filename: file.name,
      totalPages: parseResult.totalPages,
      documentType: parseResult.documentType,
      totalExtracted: parseResult.questions.length,
      extractedQuestions: parseResult.questions,
      message: `Berhasil mengekstrak ${parseResult.questions.length} soal dari PDF. Silakan periksa hasil ekstraksi sebelum melakukan impor.`,
    });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat memproses unggahan PDF.' },
      { status: 500 }
    );
  }
}

