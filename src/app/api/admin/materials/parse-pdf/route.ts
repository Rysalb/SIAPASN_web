import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { parseMaterialPdf } from '@/lib/material-pdf-parser';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    const contentType = req.headers.get('content-type') || '';

    let buffer: Buffer;
    let filename: string;
    let documentId: string | null = null;
    let startPage: number | undefined;
    let endPage: number | undefined;
    let overrideTitle: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      startPage = formData.get('startPage') ? parseInt(formData.get('startPage') as string) : undefined;
      endPage = formData.get('endPage') ? parseInt(formData.get('endPage') as string) : undefined;
      overrideTitle = (formData.get('overrideTitle') as string) || undefined;

      if (!file) {
        return NextResponse.json({ error: 'File PDF wajib diunggah.' }, { status: 400 });
      }

      if (!file.name.toLowerCase().endsWith('.pdf')) {
        return NextResponse.json({ error: 'Format berkas harus berupa PDF.' }, { status: 400 });
      }

      // Check if file with same name has already been used for a material
      const existingDocWithMaterial = await prisma.document.findFirst({
        where: {
          filename: file.name,
          materials: { some: {} },
        },
        include: {
          materials: { select: { title: true } },
        },
      });

      if (existingDocWithMaterial && existingDocWithMaterial.materials.length > 0) {
        return NextResponse.json(
          {
            error: `Berkas "${file.name}" sudah pernah dibuatkan modul materi: "${existingDocWithMaterial.materials[0].title}". Untuk mencegah materi ganda (duplikat), berkas ini tidak dapat diekstrak ulang.`,
          },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      filename = file.name;

      // Save to public uploads
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const safeFilename = `${Date.now()}-${filename.replace(/\s+/g, '_')}`;
      const filePath = path.join(uploadsDir, safeFilename);
      fs.writeFileSync(filePath, buffer);

      // Create document entry
      const doc = await prisma.document.create({
        data: {
          filename,
          storagePath: `/uploads/${safeFilename}`,
          fileSize: buffer.length,
          totalPages: 1, // updated after parse
          documentType: 'MATERI',
          processingStatus: 'COMPLETED',
          uploadedById: admin.id,
        },
      });
      documentId = doc.id;
    } else {
      // JSON body with existing documentId
      const body = await req.json();
      documentId = body.documentId;
      startPage = body.startPage ? parseInt(body.startPage) : undefined;
      endPage = body.endPage ? parseInt(body.endPage) : undefined;
      overrideTitle = body.overrideTitle;

      if (!documentId) {
        return NextResponse.json({ error: 'ID Dokumen wajib disertakan.' }, { status: 400 });
      }

      const doc = await prisma.document.findUnique({ where: { id: documentId } });
      if (!doc) {
        return NextResponse.json({ error: 'Dokumen tidak ditemukan.' }, { status: 404 });
      }

      // Check if this document already has a material created from it
      const existingMaterial = await prisma.material.findFirst({
        where: { documentId },
        select: { id: true, title: true },
      });

      if (existingMaterial) {
        return NextResponse.json(
          {
            error: `Dokumen "${doc.filename}" sudah pernah dibuatkan modul materi: "${existingMaterial.title}". Berkas ini tidak dapat dibuat ulang untuk mencegah materi ganda (double).`,
          },
          { status: 400 }
        );
      }

      filename = doc.filename;
      const localFilePath = path.join(process.cwd(), 'public', doc.storagePath.replace(/^\//, ''));
      if (!fs.existsSync(localFilePath)) {
        return NextResponse.json({ error: 'Berkas PDF fisik tidak ditemukan pada server.' }, { status: 404 });
      }

      buffer = fs.readFileSync(localFilePath);
    }

    // Parse the PDF with our intelligent material parser
    const parseResult = await parseMaterialPdf(buffer, filename, {
      startPage,
      endPage,
      overrideTitle,
    });

    // Update document totalPages if newly created
    if (documentId) {
      await prisma.document.update({
        where: { id: documentId },
        data: { totalPages: parseResult.totalPages },
      });
    }

    // Match category in database
    const matchedCategory = await prisma.category.findFirst({
      where: { code: parseResult.categoryCode },
      select: { id: true, name: true, code: true },
    });

    return NextResponse.json({
      success: true,
      documentId,
      filename,
      title: parseResult.title,
      description: parseResult.description,
      categoryCode: parseResult.categoryCode,
      categoryId: matchedCategory?.id || null,
      suggestedReadTime: parseResult.suggestedReadTime,
      totalPages: parseResult.totalPages,
      extractedPagesCount: parseResult.extractedPagesCount,
      startPage: parseResult.startPage,
      endPage: parseResult.endPage,
      chaptersCount: parseResult.chapters.length,
      chapters: parseResult.chapters,
      message: `Berhasil mengekstrak ${parseResult.chapters.length} bab materi dari berkas PDF.`,
    });
  } catch (error: any) {
    console.error('Material PDF parser error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Terjadi kesalahan saat memproses berkas PDF materi.',
      },
      { status: 500 }
    );
  }
}

