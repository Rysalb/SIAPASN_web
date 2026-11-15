import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const settings = await prisma.systemSetting.findMany();
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { settings } = await req.json();

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: 'Settings array required' }, { status: 400 });
    }

    for (const s of settings) {
      await prisma.systemSetting.upsert({
        where: { key: s.key },
        update: { value: String(s.value) },
        create: {
          key: s.key,
          value: String(s.value),
          description: s.description || null,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Pengaturan berhasil disimpan.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 });
  }
}

