import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = { code: category };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const materials = await prisma.material.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        subcategory: true,
        document: {
          select: { id: true, filename: true },
        },
        chapters: {
          orderBy: { orderNumber: 'asc' },
        },
      },
    });

    const categories = await prisma.category.findMany({
      include: { subcategories: true },
    });

    return NextResponse.json({ materials, categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const { categoryId, subcategoryId, title, description, readTimeMinutes = 10, chapters, documentId } = body;

    if (!categoryId || !title || !Array.isArray(chapters) || chapters.length === 0) {
      return NextResponse.json(
        { error: 'Kategori, judul materi, dan minimal satu bab materi wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Prevent duplicate title
    const duplicateTitle = await prisma.material.findFirst({
      where: { title: title.trim() },
      select: { id: true, title: true },
    });
    if (duplicateTitle) {
      return NextResponse.json(
        {
          error: `Modul materi dengan judul "${title.trim()}" sudah ada di database. Silakan gunakan judul lain untuk mencegah duplikasi.`,
        },
        { status: 400 }
      );
    }

    // 2. Prevent duplicate material from the same source document
    if (documentId) {
      const existingDocMaterial = await prisma.material.findFirst({
        where: { documentId },
        select: { id: true, title: true },
      });
      if (existingDocMaterial) {
        return NextResponse.json(
          {
            error: `Dokumen PDF ini sudah pernah dibuat menjadi modul materi: "${existingDocMaterial.title}". Tidak dapat membuat materi ganda dari berkas yang sama.`,
          },
          { status: 400 }
        );
      }
    }

    const material = await prisma.material.create({
      data: {
        categoryId,
        subcategoryId: subcategoryId || null,
        documentId: documentId || null,
        title: title.trim(),
        description: description?.trim() || null,
        content: chapters.map((c: any) => `# ${c.title}\n\n${c.content}`).join('\n\n---\n\n'),
        readTimeMinutes: parseInt(readTimeMinutes),
        status: 'PUBLISHED',
        chapters: {
          create: chapters.map((ch: any, idx: number) => ({
            title: ch.title.trim(),
            content: ch.content.trim(),
            orderNumber: idx + 1,
          })),
        },
      },
      include: { chapters: true },
    });

    return NextResponse.json({ success: true, material });
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
      return NextResponse.json({ error: 'ID materi wajib disertakan.' }, { status: 400 });
    }

    await prisma.material.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Materi berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}

